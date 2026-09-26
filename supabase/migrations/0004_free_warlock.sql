CREATE TYPE "public"."AuditLogEventTypeEnum" AS ENUM('run_started', 'crawl_started', 'crawl_finished', 'tasks_planned', 'check_started', 'check_finished', 'progress', 'run_completed', 'run_failed', 'error');--> statement-breakpoint
CREATE TYPE "public"."AuditLogLevelEnum" AS ENUM('debug', 'info', 'warn', 'error');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_audit_id" uuid NOT NULL,
	"sequence" integer NOT NULL,
	"type" "AuditLogEventTypeEnum" NOT NULL,
	"level" "AuditLogLevelEnum" DEFAULT 'info' NOT NULL,
	"message" text NOT NULL,
	"data" jsonb,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "auditLog_siteAudit_fkey" FOREIGN KEY ("site_audit_id") REFERENCES "public"."site_audits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "auditLog_siteAuditId_sequence_uq" ON "audit_logs" USING btree ("site_audit_id","sequence");--> statement-breakpoint
CREATE INDEX "auditLog_siteAuditId_idx" ON "audit_logs" USING btree ("site_audit_id");--> statement-breakpoint
CREATE INDEX "auditLog_type_idx" ON "audit_logs" USING btree ("type");--> statement-breakpoint
CREATE INDEX "auditLog_level_idx" ON "audit_logs" USING btree ("level");