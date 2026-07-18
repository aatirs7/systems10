import { eq } from "drizzle-orm";
import { db } from "@/db";
import { brands, type Brand, type BrandStatus } from "@/db/schema";
import { canTransition } from "@/lib/status";
import { canonicalHandle } from "@/lib/ingest";

/** Resolve a brand by numeric id or tiktok_handle. Returns null if not found. */
export async function resolveBrand(ref: {
  brandId?: number;
  tiktokHandle?: string;
}): Promise<Brand | null> {
  if (ref.brandId !== undefined) {
    const [b] = await db.select().from(brands).where(eq(brands.id, ref.brandId)).limit(1);
    return b ?? null;
  }
  if (ref.tiktokHandle !== undefined) {
    const handle = canonicalHandle(ref.tiktokHandle);
    const [b] = await db.select().from(brands).where(eq(brands.tiktokHandle, handle)).limit(1);
    return b ?? null;
  }
  return null;
}

export type StatusChangeResult =
  | { ok: true; brand: Brand }
  | { ok: false; error: string; code: number };

/**
 * Apply a status transition with the shared status-machine guard (spec §3.4).
 * Rejects illegal jumps with a 409. `assigned` requires an assignedStudentId (spec §3.8).
 */
export async function changeBrandStatus(
  brandId: number,
  to: BrandStatus,
  opts: { assignedStudentId?: string } = {},
): Promise<StatusChangeResult> {
  const [brand] = await db.select().from(brands).where(eq(brands.id, brandId)).limit(1);
  if (!brand) return { ok: false, error: "Brand not found", code: 404 };

  if (brand.status === to) return { ok: true, brand };

  if (!canTransition(brand.status, to)) {
    return {
      ok: false,
      error: `Illegal transition: ${brand.status} → ${to}`,
      code: 409,
    };
  }

  if (to === "assigned" && !opts.assignedStudentId) {
    return {
      ok: false,
      error: "assignedStudentId is required to move a brand to 'assigned'",
      code: 400,
    };
  }

  const [updated] = await db
    .update(brands)
    .set({
      status: to,
      assignedStudentId: to === "assigned" ? opts.assignedStudentId! : brand.assignedStudentId,
      updatedAt: new Date(),
    })
    .where(eq(brands.id, brandId))
    .returning();

  return { ok: true, brand: updated };
}
