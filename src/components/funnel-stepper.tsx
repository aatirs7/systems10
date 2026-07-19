import type { BrandStatus } from "@/db/schema";
import { FUNNEL_ORDER, STATUS_LABELS, STATUS_HUE } from "@/lib/status";

// Horizontal progress rail showing where a brand sits in the funnel.
// Archived brands render a muted single marker instead of the rail.
export function FunnelStepper({ status }: { status: BrandStatus }) {
  if (status === "archived") {
    return (
      <div className="flex items-center gap-2 text-sm text-faint">
        <span className="h-2 w-2 rounded-full bg-faint" />
        Archived, removed from the active funnel
      </div>
    );
  }

  const currentIndex = FUNNEL_ORDER.indexOf(status);

  return (
    <div className="flex items-center gap-1">
      {FUNNEL_ORDER.map((s, i) => {
        const reached = i <= currentIndex;
        const isCurrent = i === currentIndex;
        const hue = STATUS_HUE[status];
        return (
          <div key={s} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-center">
              <span
                className="h-2 w-2 shrink-0 rounded-full transition"
                style={{
                  backgroundColor: reached ? hue : "rgba(255,255,255,0.12)",
                  boxShadow: isCurrent ? `0 0 0 4px ${hue}22` : undefined,
                }}
              />
              {i < FUNNEL_ORDER.length - 1 && (
                <span
                  className="h-px flex-1"
                  style={{ backgroundColor: i < currentIndex ? hue : "rgba(255,255,255,0.1)" }}
                />
              )}
            </div>
            <span
              className={`font-mono text-[9px] uppercase tracking-wider ${
                isCurrent ? "text-fog" : reached ? "text-muted" : "text-faint"
              }`}
            >
              {STATUS_LABELS[s].split(" ")[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
