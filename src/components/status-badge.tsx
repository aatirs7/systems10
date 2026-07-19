import type { BrandStatus } from "@/db/schema";
import { STATUS_LABELS, STATUS_HUE } from "@/lib/status";

export function StatusBadge({ status, size = "sm" }: { status: BrandStatus; size?: "sm" | "md" }) {
  const hue = STATUS_HUE[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-medium ${
        size === "md" ? "px-2.5 py-1 text-[12px]" : "px-2 py-0.5 text-[11px]"
      }`}
      style={{
        color: hue,
        borderColor: `${hue}33`,
        backgroundColor: `${hue}14`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: hue }} />
      {STATUS_LABELS[status]}
    </span>
  );
}
