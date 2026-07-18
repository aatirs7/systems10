import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { brands, outreachLog } from "@/db/schema";
import { requireApiKey } from "@/lib/api-auth";
import { replySchema } from "@/lib/validation";
import { resolveBrand } from "@/lib/brands";

// POST /api/webhooks/reply
// Instantly / LinkedIn tool reports a reply. Logs it, and a positive reply advances the
// brand to "interested" for the closer to action (spec §3.5, §3.7).
// Idempotent: a repeated positive reply for a brand already at/after "interested" is a no-op advance.
export async function POST(req: Request) {
  const unauthorized = requireApiKey(req);
  if (unauthorized) return unauthorized;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = replySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const brand = await resolveBrand(parsed.data);
  if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

  const { channel, sequenceStep, replySentiment } = parsed.data;

  // Log the reply against the most recent matching touch if present, else a new log row.
  const [existingTouch] = await db
    .select()
    .from(outreachLog)
    .where(and(eq(outreachLog.brandId, brand.id), eq(outreachLog.channel, channel)))
    .orderBy(desc(outreachLog.id))
    .limit(1);

  if (existingTouch) {
    await db
      .update(outreachLog)
      .set({ replied: true, replySentiment })
      .where(eq(outreachLog.id, existingTouch.id));
  } else {
    await db.insert(outreachLog).values({
      brandId: brand.id,
      channel,
      sequenceStep: sequenceStep ?? null,
      replied: true,
      replySentiment,
    });
  }

  // Positive reply → advance to interested, but only from a pre-interested state (idempotent).
  let updatedBrand = brand;
  const preInterested = ["sourced", "enriching", "ready_to_contact", "sequencing"];
  if (replySentiment === "positive" && preInterested.includes(brand.status)) {
    const [updated] = await db
      .update(brands)
      .set({ status: "interested", updatedAt: new Date() })
      .where(eq(brands.id, brand.id))
      .returning();
    updatedBrand = updated;
  }

  return NextResponse.json({ ok: true, brand: updatedBrand, statusChanged: updatedBrand.status !== brand.status });
}
