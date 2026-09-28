CREATE TYPE "public"."UserEventTypeEnum" AS ENUM('auth.login', 'auth.logout', 'auth.login_failed', 'auth.password_changed', 'auth.password_reset', 'device.new_detected', 'admin.impersonation');--> statement-breakpoint
CREATE TABLE "user_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"fingerprint" text NOT NULL,
	"browser" text,
	"os" text,
	"device_type" text,
	"first_seen_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"device_id" uuid,
	"session_id" text NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"login_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"logout_at" timestamp (3) with time zone,
	"expires_at" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"email" varchar(255),
	"event" "UserEventTypeEnum" NOT NULL,
	"session_id" text,
	"device_id" uuid,
	"ip_address" varchar(45),
	"user_agent" text,
	"metadata" jsonb,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "user_activities" CASCADE;--> statement-breakpoint
ALTER TABLE "user_devices" ADD CONSTRAINT "user_device_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_session_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_session_device_fkey" FOREIGN KEY ("device_id") REFERENCES "public"."user_devices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_events" ADD CONSTRAINT "user_event_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_events" ADD CONSTRAINT "user_event_device_fkey" FOREIGN KEY ("device_id") REFERENCES "public"."user_devices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_device_user_fingerprint_idx" ON "user_devices" USING btree ("user_id","fingerprint");--> statement-breakpoint
CREATE INDEX "user_device_user_id_idx" ON "user_devices" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_session_session_id_idx" ON "user_sessions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "user_session_user_id_idx" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_session_login_at_idx" ON "user_sessions" USING btree ("login_at");--> statement-breakpoint
CREATE INDEX "user_session_last_seen_at_idx" ON "user_sessions" USING btree ("last_seen_at");--> statement-breakpoint
CREATE INDEX "user_event_user_id_idx" ON "user_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_event_event_idx" ON "user_events" USING btree ("event");--> statement-breakpoint
CREATE INDEX "user_event_created_at_idx" ON "user_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_event_session_id_idx" ON "user_events" USING btree ("session_id");