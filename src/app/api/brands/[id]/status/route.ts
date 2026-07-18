import { NextResponse } from "next/server";
import { requireApiKey } from "@/lib/api-auth";
import { statusChangeSchema } from "@/lib/validation";
import { changeBrandStatus } from "@/lib/brands";

// POST /api/brands/:id/status
// Guarded status transition (spec §3.4). Illegal jumps return 409; "assigned" needs
// assignedStudentId. Backs both Make.com automations and the admin UI.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireApiKey(req);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const brandId = Number(id);
  if (!Number.isInteger(brandId) || brandId <= 0) {
    return NextResponse.json({ error: "Invalid brand id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = statusChangeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const result = await changeBrandStatus(brandId, parsed.data.status, {
    assignedStudentId: parsed.data.assignedStudentId,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.code });
  }

  return NextResponse.json({ ok: true, brand: result.brand });
}
