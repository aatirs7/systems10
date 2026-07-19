import type { BrandStatus } from "@/db/schema";

// The acquisition funnel status machine (spec §3.4 / §3.7).
// Every non-terminal status can also jump to `archived` (an escape hatch), added below.
const BASE_TRANSITIONS: Record<BrandStatus, BrandStatus[]> = {
  sourced: ["enriching"],
  enriching: ["ready_to_contact"],
  ready_to_contact: ["sequencing"],
  sequencing: ["interested"],
  interested: ["closed"],
  closed: ["assigned"],
  assigned: [],
  archived: [],
};

export const ALLOWED_TRANSITIONS: Record<BrandStatus, BrandStatus[]> = Object.fromEntries(
  Object.entries(BASE_TRANSITIONS).map(([from, to]) => [
    from,
    from === "archived" ? to : [...to, "archived" as BrandStatus],
  ]),
) as Record<BrandStatus, BrandStatus[]>;

export function canTransition(from: BrandStatus, to: BrandStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export const BRAND_STATUSES: BrandStatus[] = [
  "sourced",
  "enriching",
  "ready_to_contact",
  "sequencing",
  "interested",
  "closed",
  "assigned",
  "archived",
];

// Human-friendly labels for the admin UI.
export const STATUS_LABELS: Record<BrandStatus, string> = {
  sourced: "Sourced",
  enriching: "Enriching",
  ready_to_contact: "Ready to contact",
  sequencing: "Sequencing",
  interested: "Interested",
  closed: "Closed",
  assigned: "Assigned",
  archived: "Archived",
};

// Funnel-aware accent colour per status (hex). Cool early, warm/green as a brand
// progresses toward closed. Used for dots, pills, and the pipeline stepper.
export const STATUS_HUE: Record<BrandStatus, string> = {
  sourced: "#8B93A1",
  enriching: "#F5B94A",
  ready_to_contact: "#49B7F7",
  sequencing: "#A78BFA",
  interested: "#C9F24A",
  closed: "#34D399",
  assigned: "#E879F9",
  archived: "#5B6169",
};

// The linear funnel order (excludes archived) for the detail stepper.
export const FUNNEL_ORDER: BrandStatus[] = [
  "sourced",
  "enriching",
  "ready_to_contact",
  "sequencing",
  "interested",
  "closed",
  "assigned",
];
