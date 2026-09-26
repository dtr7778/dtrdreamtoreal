ALTER TYPE "public"."EmailStatusEnum" ADD VALUE 'received' BEFORE 'delivered';--> statement-breakpoint
ALTER TYPE "public"."EmailStatusEnum" ADD VALUE 'delivery_delayed' BEFORE 'bounced';--> statement-breakpoint
ALTER TYPE "public"."EmailStatusEnum" ADD VALUE 'suppressed' BEFORE 'failed';--> statement-breakpoint
CREATE TABLE "company_ai_usages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"ai_usage_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_usages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" varchar(50) DEFAULT 'openrouter' NOT NULL,
	"model" varchar(150) NOT NULL,
	"activity" varchar(100) NOT NULL,
	"prompt_tokens" integer DEFAULT 0 NOT NULL,
	"completion_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"cost" double precision,
	"latency_ms" integer DEFAULT 0 NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "context" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "company_ai_usages" ADD CONSTRAINT "companyAiUsage_companyId_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_ai_usages" ADD CONSTRAINT "companyAiUsage_aiUsageId_fkey" FOREIGN KEY ("ai_usage_id") REFERENCES "public"."ai_usages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usages" ADD CONSTRAINT "ai_usage_createdBy_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "companyAiUsage_companyId_idx" ON "company_ai_usages" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "companyAiUsage_aiUsageId_idx" ON "company_ai_usages" USING btree ("ai_usage_id");--> statement-breakpoint
CREATE INDEX "ai_usages_createdBy_idx" ON "ai_usages" USING btree ("created_by");