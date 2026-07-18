import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { brands, contacts } from "@/db/schema";
import { requireApiKey } from "@/lib/api-auth";
import { enrichmentSchema } from "@/lib/validation";
import { resolveBrand } from "@/lib/brands";

// POST /api/webhooks/enrichment
// Clay/Make pushes the resolved contact; creates the contact row, sets contact_type + domain,
// and advances the brand to "ready_to_contact" (spec §3.3).
export async function POST(req: Request) {
  const unauthorized = requireApiKey(req);
  if (unauthorized) return unauthorized;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = enrichmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const brand = await resolveBrand(parsed.data);
  if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

  const { contact, contactType, domain } = parsed.data;

  await db.insert(contacts).values({
    brandId: brand.id,
    contactName: contact.contactName ?? null,
    title: contact.title ?? null,
    email: contact.email ?? null,
    emailVerified: contact.emailVerified ?? false,
    linkedinUrl: contact.linkedinUrl ?? null,
  });

  // Advance to ready_to_contact unless the brand is already further along the funnel.
  const shouldAdvance = ["sourced", "enriching"].includes(brand.status);
  const [updated] = await db
    .update(brands)
    .set({
      contactType,
      domain: domain ?? brand.domain,
      status: shouldAdvance ? "ready_to_contact" : brand.status,
      updatedAt: new Date(),
    })
    .where(eq(brands.id, brand.id))
    .returning();

  return NextResponse.json({ ok: true, brand: updated });
}
