import Papa from "papaparse";
import { inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { brands, type NewBrand } from "@/db/schema";

export type IngestSummary = {
  totalRows: number;
  inserted: number;
  refreshed: number;
  invalid: { row: number; reason: string }[];
};

// Map a Kalodata header to a normalized key (lowercase, alphanumeric only).
function norm(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Synonyms Kalodata / manual exports commonly use for each logical field.
const FIELD_SYNONYMS: Record<string, string[]> = {
  brandName: ["brandname", "brand", "storename", "store", "shopname", "seller", "sellername"],
  tiktokHandle: [
    "tiktokhandle",
    "handle",
    "tiktokshopurl",
    "shopurl",
    "storeurl",
    "url",
    "tiktokshop",
    "shop",
  ],
  monthlyGmv: ["monthlygmv", "gmv", "revenue", "monthlyrevenue", "sales"],
  category: ["category", "productcategory", "categoryname"],
};

function pick(row: Record<string, string>, logical: keyof typeof FIELD_SYNONYMS): string | undefined {
  const normalized: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) normalized[norm(k)] = v;
  for (const candidate of FIELD_SYNONYMS[logical]) {
    const val = normalized[candidate];
    if (val !== undefined && String(val).trim() !== "") return String(val).trim();
  }
  return undefined;
}

// Turn a handle or storefront URL into a canonical dedup key: lowercase, no leading @,
// URL path segment extracted if a full URL was provided.
export function canonicalHandle(raw: string): string {
  let h = raw.trim();
  if (/^https?:\/\//i.test(h)) {
    try {
      const u = new URL(h);
      const seg = u.pathname.split("/").filter(Boolean).pop() ?? u.hostname;
      h = seg;
    } catch {
      // fall through and use the raw string
    }
  }
  return h.replace(/^@/, "").toLowerCase();
}

// Parse a GMV cell like "$12,500" or "12.5k" into a numeric string, or null.
function parseGmv(raw: string | undefined): string | null {
  if (!raw) return null;
  let s = raw.trim().toLowerCase().replace(/[$,\s]/g, "");
  let multiplier = 1;
  if (s.endsWith("k")) {
    multiplier = 1_000;
    s = s.slice(0, -1);
  } else if (s.endsWith("m")) {
    multiplier = 1_000_000;
    s = s.slice(0, -1);
  }
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return String(n * multiplier);
}

/**
 * Ingest Kalodata CSV text: validate rows, de-duplicate by tiktok_handle,
 * insert new brands (status=sourced) and refresh monthly_gmv on existing ones (spec §3.1).
 */
export async function ingestKalodataCsv(csvText: string): Promise<IngestSummary> {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const invalid: IngestSummary["invalid"] = [];
  // Keep the last occurrence per handle so a file with dupes collapses cleanly.
  const byHandle = new Map<string, NewBrand>();

  parsed.data.forEach((row, i) => {
    const rowNum = i + 2; // +1 for header, +1 for 1-based
    const brandName = pick(row, "brandName");
    const handleRaw = pick(row, "tiktokHandle");

    if (!brandName) {
      invalid.push({ row: rowNum, reason: "Missing brand/store name" });
      return;
    }
    if (!handleRaw) {
      invalid.push({ row: rowNum, reason: "Missing TikTok handle / shop URL" });
      return;
    }

    const tiktokHandle = canonicalHandle(handleRaw);
    if (!tiktokHandle) {
      invalid.push({ row: rowNum, reason: "Could not derive a TikTok handle" });
      return;
    }

    byHandle.set(tiktokHandle, {
      brandName,
      tiktokHandle,
      monthlyGmv: parseGmv(pick(row, "monthlyGmv")),
      category: pick(row, "category") ?? null,
      status: "sourced",
    });
  });

  const rows = [...byHandle.values()];
  if (rows.length === 0) {
    return { totalRows: parsed.data.length, inserted: 0, refreshed: 0, invalid };
  }

  // Determine which handles already exist so we can report inserted vs refreshed.
  const handles = rows.map((r) => r.tiktokHandle);
  const existing = await db
    .select({ tiktokHandle: brands.tiktokHandle })
    .from(brands)
    .where(inArray(brands.tiktokHandle, handles));
  const existingSet = new Set(existing.map((e) => e.tiktokHandle));

  // On conflict, refresh only monthly_gmv (+ updated_at) - never reset pipeline status (spec §3.1).
  await db
    .insert(brands)
    .values(rows)
    .onConflictDoUpdate({
      target: brands.tiktokHandle,
      set: {
        monthlyGmv: sql`excluded.monthly_gmv`,
        updatedAt: sql`now()`,
      },
    });

  const refreshed = rows.filter((r) => existingSet.has(r.tiktokHandle)).length;
  const inserted = rows.length - refreshed;

  return { totalRows: parsed.data.length, inserted, refreshed, invalid };
}
