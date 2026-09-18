ALTER TABLE "companies" ADD COLUMN "created_by" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "created_by" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "company_createdBy_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employee_createdBy_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "companies_createdBy_idx" ON "companies" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "employee_createdBy_idx" ON "employees" USING btree ("created_by");