CREATE TYPE "public"."AuditItemStatusEnum" AS ENUM('pending', 'running', 'passed', 'failed', 'warning', 'needs_review', 'error', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."AuditStatusEnum" AS ENUM('pending', 'running', 'completed', 'failed', 'partial', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."CwvSourceEnum" AS ENUM('psi', 'crux', 'crux_history', 'bigquery');--> statement-breakpoint
CREATE TYPE "public"."CwvStrategyEnum" AS ENUM('phone', 'desktop');--> statement-breakpoint
CREATE TABLE "audit_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_audit_id" uuid NOT NULL,
	"checklist_key" varchar(150) NOT NULL,
	"section" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"url" varchar,
	"status" "AuditItemStatusEnum" DEFAULT 'pending' NOT NULL,
	"message" text,
	"evidence" jsonb,
	"duration_ms" integer,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cwv_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_audit_id" uuid NOT NULL,
	"url" varchar(2048) NOT NULL,
	"strategy" "CwvStrategyEnum" NOT NULL,
	"source" "CwvSourceEnum" NOT NULL,
	"lcp" double precision,
	"inp" double precision,
	"cls" double precision,
	"ttfb" double precision,
	"fcp" double precision,
	"performance_score" double precision,
	"country_code" varchar(8),
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_audits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"url" varchar NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" "AuditStatusEnum" DEFAULT 'pending' NOT NULL,
	"report_image_file_id" uuid,
	"error" text,
	"total_items" integer DEFAULT 0 NOT NULL,
	"completed_items" integer DEFAULT 0 NOT NULL,
	"passed_items" integer DEFAULT 0 NOT NULL,
	"failed_items" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp (3) with time zone,
	"completed_at" timestamp (3) with time zone,
	"triggered_by" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_items" ADD CONSTRAINT "auditItem_siteAudit_fkey" FOREIGN KEY ("site_audit_id") REFERENCES "public"."site_audits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cwv_snapshots" ADD CONSTRAINT "cwvSnapshot_siteAudit_fkey" FOREIGN KEY ("site_audit_id") REFERENCES "public"."site_audits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_audits" ADD CONSTRAINT "siteAudit_company_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_audits" ADD CONSTRAINT "siteAudit_triggerdBy_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auditItem_siteAuditId_idx" ON "audit_items" USING btree ("site_audit_id");--> statement-breakpoint
CREATE INDEX "auditItem_checklistKey_idx" ON "audit_items" USING btree ("checklist_key");--> statement-breakpoint
CREATE INDEX "auditItem_status_idx" ON "audit_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "auditItem_url_idx" ON "audit_items" USING btree ("url");--> statement-breakpoint
CREATE INDEX "cwvSnapshot_siteAuditId_idx" ON "cwv_snapshots" USING btree ("site_audit_id");--> statement-breakpoint
CREATE INDEX "cwvSnapshot_url_idx" ON "cwv_snapshots" USING btree ("url");--> statement-breakpoint
CREATE INDEX "cwvSnapshot_strategy_idx" ON "cwv_snapshots" USING btree ("strategy");--> statement-breakpoint
CREATE INDEX "cwvSnapshot_source_idx" ON "cwv_snapshots" USING btree ("source");--> statement-breakpoint
CREATE INDEX "cwvSnapshot_countryCode_idx" ON "cwv_snapshots" USING btree ("country_code");--> statement-breakpoint
CREATE INDEX "siteAudit_companyId_idx" ON "site_audits" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "siteAudit_triggeredBy_idx" ON "site_audits" USING btree ("triggered_by");--> statement-breakpoint
CREATE INDEX "siteAudit_createdAt_idx" ON "site_audits" USING btree ("created_at");