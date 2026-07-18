import { NextResponse } from "next/server";
import { db } from "@/db";
import { outreachLog } from "@/db/schema";
import { requireApiKey } from "@/lib/api-auth";
import { outreachEventSchema } from "@/lib/validation";
import { resolveBrand } from "@/lib/brands";

// POST /api/webhooks/outreach-event
// Instantly / LinkedIn tool logs a sent or opened touch into the outreach log (spec §3.4).
export async function POST(req: Request) {
  const unauthorized = requireApiKey(req);
  if (unauthorized) return unauthorized;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = outreachEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const brand = await resolveBrand(parsed.data);
  if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

  const { channel, sequenceStep, sentAt, opened } = parsed.data;

  const [entry] = await db
    .insert(outreachLog)
    .values({
      brandId: brand.id,
      channel,
      sequenceStep: sequenceStep ?? null,
      sentAt: sentAt ? new Date(sentAt) : new Date(),
      opened: opened ?? false,
      replied: false,
    })
    .returning();

  return NextResponse.json({ ok: true, entry });
}
