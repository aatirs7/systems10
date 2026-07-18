"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { ingestKalodataCsv, type IngestSummary } from "@/lib/ingest";
import { changeBrandStatus } from "@/lib/brands";
import type { BrandStatus } from "@/db/schema";

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
}

export type IngestActionResult =
  | { ok: true; summary: IngestSummary }
  | { ok: false; error: string };

// Server action behind the CSV upload panel (spec §3.1).
export async function uploadKalodataCsv(formData: FormData): Promise<IngestActionResult> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Please choose a CSV file." };
  }
  const text = await file.text();
  try {
    const summary = await ingestKalodataCsv(text);
    revalidatePath("/pipeline");
    return { ok: true, summary };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Ingestion failed" };
  }
}

export type StatusActionResult = { ok: true } | { ok: false; error: string };

// Server action behind the brand-detail status control (spec §3.7, §3.8).
export async function updateStatus(
  brandId: number,
  status: BrandStatus,
  assignedStudentId?: string,
): Promise<StatusActionResult> {
  await requireAdmin();
  const result = await changeBrandStatus(brandId, status, { assignedStudentId });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath(`/brands/${brandId}`);
  revalidatePath("/pipeline");
  revalidatePath("/replies");
  return { ok: true };
}
