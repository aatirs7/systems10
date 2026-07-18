CREATE TYPE "public"."brand_status" AS ENUM('sourced', 'enriching', 'ready_to_contact', 'sequencing', 'interested', 'closed', 'assigned', 'archived');--> statement-breakpoint
CREATE TYPE "public"."contact_type" AS ENUM('owner', 'generic');--> statement-breakpoint
CREATE TYPE "public"."outreach_channel" AS ENUM('email', 'linkedin');--> statement-breakpoint
CREATE TYPE "public"."reply_sentiment" AS ENUM('positive', 'negative', 'neutral');--> statement-breakpoint
CREATE TABLE "brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand_name" text NOT NULL,
	"tiktok_handle" text NOT NULL,
	"monthly_gmv" numeric,
	"category" text,
	"domain" text,
	"status" "brand_status" DEFAULT 'sourced' NOT NULL,
	"contact_type" "contact_type",
	"date_sourced" timestamp with time zone DEFAULT now() NOT NULL,
	"assigned_student_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "brands_tiktok_handle_unique" UNIQUE("tiktok_handle")
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand_id" integer NOT NULL,
	"contact_name" text,
	"title" text,
	"email" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"linkedin_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outreach_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand_id" integer NOT NULL,
	"channel" "outreach_channel" NOT NULL,
	"sequence_step" integer,
	"sent_at" timestamp with time zone,
	"opened" boolean DEFAULT false NOT NULL,
	"replied" boolean DEFAULT false NOT NULL,
	"reply_sentiment" "reply_sentiment",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_brand_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outreach_log" ADD CONSTRAINT "outreach_log_brand_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;