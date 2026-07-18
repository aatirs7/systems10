import {
  boolean,
  foreignKey,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// --- Enums (spec §3.4) ---

// Full acquisition funnel lifecycle: sourced → … → assigned, with archived as an escape hatch.
export const brandStatusEnum = pgEnum("brand_status", [
  "sourced",
  "enriching",
  "ready_to_contact",
  "sequencing",
  "interested",
  "closed",
  "assigned",
  "archived",
]);

export const contactTypeEnum = pgEnum("contact_type", ["owner", "generic"]);

export const outreachChannelEnum = pgEnum("outreach_channel", ["email", "linkedin"]);

export const replySentimentEnum = pgEnum("reply_sentiment", [
  "positive",
  "negative",
  "neutral",
]);

// --- Brands: the source of truth for every sourced brand (spec §3.4) ---

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  brandName: text("brand_name").notNull(),
  // Unique dedup key - re-importing the same Kalodata export must not duplicate a brand.
  tiktokHandle: text("tiktok_handle").notNull().unique(),
  monthlyGmv: numeric("monthly_gmv"),
  category: text("category"),
  // Nullable - many TikTok-Shop-only brands have no resolvable domain (spec §3.2).
  domain: text("domain"),
  status: brandStatusEnum("status").notNull().default("sourced"),
  // Set during enrichment (spec §3.3); null until a contact path is resolved.
  contactType: contactTypeEnum("contact_type"),
  dateSourced: timestamp("date_sourced", { withTimezone: true }).notNull().defaultNow(),
  // Only set once status = assigned (LMS handoff, spec §3.8).
  assignedStudentId: text("assigned_student_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Contacts: the resolved person (or generic inbox) for a brand (spec §3.3) ---

export const contacts = pgTable(
  "contacts",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id").notNull(),
    contactName: text("contact_name"),
    title: text("title"),
    email: text("email"),
    emailVerified: boolean("email_verified").notNull().default(false),
    linkedinUrl: text("linkedin_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    brandFk: foreignKey({
      columns: [table.brandId],
      foreignColumns: [brands.id],
      name: "contacts_brand_id_fk",
    }).onDelete("cascade"),
  }),
);

// --- Outreach log: every touch and reply across email + LinkedIn (spec §3.4) ---

export const outreachLog = pgTable(
  "outreach_log",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id").notNull(),
    channel: outreachChannelEnum("channel").notNull(),
    sequenceStep: integer("sequence_step"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    opened: boolean("opened").notNull().default(false), // email only
    replied: boolean("replied").notNull().default(false),
    replySentiment: replySentimentEnum("reply_sentiment"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    brandFk: foreignKey({
      columns: [table.brandId],
      foreignColumns: [brands.id],
      name: "outreach_log_brand_id_fk",
    }).onDelete("cascade"),
  }),
);

export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type OutreachLogEntry = typeof outreachLog.$inferSelect;

export type BrandStatus = (typeof brandStatusEnum.enumValues)[number];
export type ContactType = (typeof contactTypeEnum.enumValues)[number];
export type OutreachChannel = (typeof outreachChannelEnum.enumValues)[number];
export type ReplySentiment = (typeof replySentimentEnum.enumValues)[number];
