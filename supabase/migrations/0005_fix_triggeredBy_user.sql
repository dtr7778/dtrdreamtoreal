ALTER TABLE "site_audits" DROP CONSTRAINT "siteAudit_triggerdBy_fkey";
--> statement-breakpoint
ALTER TABLE "site_audits" ADD CONSTRAINT "siteAudit_triggerdBy_fkey" FOREIGN KEY ("triggered_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;