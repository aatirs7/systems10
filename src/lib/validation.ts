import { z } from "zod";

// --- Webhook payloads (spec §3.3, §3.5–3.7) ---
// Brands are addressed by tiktok_handle (the stable dedup key) or numeric brand id.

const brandRef = z
  .object({
    brandId: z.number().int().positive().optional(),
    tiktokHandle: z.string().min(1).optional(),
  })
  .refine((v) => v.brandId !== undefined || v.tiktokHandle !== undefined, {
    message: "Provide either brandId or tiktokHandle to identify the brand.",
  });

// POST /api/webhooks/enrichment - Clay/Make pushes the resolved contact.
export const enrichmentSchema = brandRef.and(
  z.object({
    domain: z.string().min(1).optional(),
    contactType: z.enum(["owner", "generic"]),
    contact: z.object({
      contactName: z.string().optional(),
      title: z.string().optional(),
      email: z.string().email().optional(),
      emailVerified: z.boolean().optional().default(false),
      linkedinUrl: z.string().url().optional(),
    }),
  }),
);

// POST /api/webhooks/outreach-event - logs a sent/opened touch.
export const outreachEventSchema = brandRef.and(
  z.object({
    channel: z.enum(["email", "linkedin"]),
    sequenceStep: z.number().int().positive().optional(),
    sentAt: z.string().datetime().optional(),
    opened: z.boolean().optional().default(false),
  }),
);

// POST /api/webhooks/reply - logs a reply; positive replies advance status to "interested".
export const replySchema = brandRef.and(
  z.object({
    channel: z.enum(["email", "linkedin"]),
    sequenceStep: z.number().int().positive().optional(),
    replySentiment: z.enum(["positive", "negative", "neutral"]),
  }),
);

// POST /api/brands/:id/status - guarded status transition.
export const statusChangeSchema = z.object({
  status: z.enum([
    "sourced",
    "enriching",
    "ready_to_contact",
    "sequencing",
    "interested",
    "closed",
    "assigned",
    "archived",
  ]),
  assignedStudentId: z.string().min(1).optional(),
});

export type EnrichmentPayload = z.infer<typeof enrichmentSchema>;
export type OutreachEventPayload = z.infer<typeof outreachEventSchema>;
export type ReplyPayload = z.infer<typeof replySchema>;
export type StatusChangePayload = z.infer<typeof statusChangeSchema>;
