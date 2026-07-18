import { NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { brands, contacts, type BrandStatus } from "@/db/schema";
import { requireApiKey } from "@/lib/api-auth";
import { BRAND_STATUSES } from "@/lib/status";

// GET /api/brands?status=ready_to_contact[&claim=true][&limit=100]
// Machine endpoint: Make.com pulls contactable brands (with their contact) to push into
// Instantly / the LinkedIn tool. With claim=true, ready_to_contact brands are advanced to
// "sequencing" so the same brand isn't pulled twice (spec §3.5–3.6).
export async function GET(req: Request) {
  const unauthorized = requireApiKey(req);
  if (unauthorized) return unauthorized;

  const url = new URL(req.url);
  const statusParam = url.searchParams.get("status");
  const claim = url.searchParams.get("claim") === "true";
  const limit = Math.min(Number(url.searchParams.get("limit")) || 200, 500);

  if (statusParam && !BRAND_STATUSES.includes(statusParam as BrandStatus)) {
    return NextResponse.json({ error: `Unknown status: ${statusParam}` }, { status: 400 });
  }
  const status = statusParam as BrandStatus | null;

  const rows = await db
    .select({
      brand: brands,
      contact: contacts,
    })
    .from(brands)
    .leftJoin(contacts, eq(contacts.brandId, brands.id))
    .where(status ? eq(brands.status, status) : undefined)
    .orderBy(desc(brands.monthlyGmv))
    .limit(limit);

  // Advance claimed ready_to_contact brands to sequencing.
  if (claim && status === "ready_to_contact") {
    const ids = rows.map((r) => r.brand.id);
    if (ids.length > 0) {
      await db
        .update(brands)
        .set({ status: "sequencing", updatedAt: new Date() })
        .where(and(inArray(brands.id, ids), eq(brands.status, "ready_to_contact")));
    }
  }

  return NextResponse.json({
    count: rows.length,
    brands: rows.map((r) => ({ ...r.brand, contact: r.contact })),
  });
}
