import type { BrandStatus } from "@/db/schema";
import { STATUS_LABELS } from "@/lib/status";

const STYLES: Record<BrandStatus, string> = {
  sourced: "bg-neutral-100 text-neutral-700",
  enriching: "bg-amber-100 text-amber-800",
  ready_to_contact: "bg-sky-100 text-sky-800",
  sequencing: "bg-indigo-100 text-indigo-800",
  interested: "bg-emerald-100 text-emerald-800",
  closed: "bg-green-600 text-white",
  assigned: "bg-purple-100 text-purple-800",
  archived: "bg-neutral-200 text-neutral-500",
};

export function StatusBadge({ status }: { status: BrandStatus }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
