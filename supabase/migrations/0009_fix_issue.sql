ALTER TABLE "companies" DROP CONSTRAINT "company_createdBy_fkey";
--> statement-breakpoint
ALTER TABLE "employees" DROP CONSTRAINT "employee_createdBy_fkey";
--> statement-breakpoint
ALTER TABLE "user_devices" DROP CONSTRAINT "user_device_user_fkey";
--> statement-breakpoint
ALTER TABLE "user_sessions" DROP CONSTRAINT "user_session_user_fkey";
--> statement-breakpoint
ALTER TABLE "user_events" DROP CONSTRAINT "user_event_user_fkey";
--> statement-breakpoint
ALTER TABLE "ai_usages" DROP CONSTRAINT "ai_usage_createdBy_fkey";
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_created_by_fkey";
--> statement-breakpoint
DROP INDEX "user_role_unique";--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "company_createdBy_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employee_createdBy_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_devices" ADD CONSTRAINT "user_device_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_session_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_events" ADD CONSTRAINT "user_event_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usages" ADD CONSTRAINT "ai_usage_createdBy_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "user_role_unique" ON "user_roles" USING btree ("user_id","role_id");