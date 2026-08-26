◇ injected env (6) from ../../.env // tip: ⌘ suppress logs { quiet: true }
CREATE TYPE "public"."ContactSubmissionStatusEnum" AS ENUM('PENDING', 'READ', 'REPLIED', 'SPAM');
CREATE TYPE "public"."FeedbackIssueStatusEnum" AS ENUM('OPEN', 'IN_PROGRESS', 'NEEDS_INFO', 'RESOLVED', 'CLOSED');
CREATE TYPE "public"."FeedbackIssueTypeEnum" AS ENUM('BUG', 'FEATURE_REQUEST', 'FEEDBACK', 'SUGGESTION', 'REPORT', 'OTHER');
CREATE TYPE "public"."NotificationCategoryEnum" AS ENUM('SYSTEM', 'AUTH', 'SUPPORT', 'LEAD');
CREATE TYPE "public"."NotificationLevelEnum" AS ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR');
CREATE TYPE "public"."RoleEnum" AS ENUM('USER', 'SUPPORT_AGENT', 'ADMIN', 'SUPER_ADMIN');
CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"phone" varchar(50),
	"company" varchar(255),
	"message" text NOT NULL,
	"status" "ContactSubmissionStatusEnum" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "contact_submission_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"replied_by" uuid NOT NULL,
	"reply" text NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_id" uuid NOT NULL,
	"actor_id" uuid,
	"category" "NotificationCategoryEnum" NOT NULL,
	"level" "NotificationLevelEnum" DEFAULT 'INFO' NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"data" jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp (3) with time zone,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "notification_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category" "NotificationCategoryEnum" NOT NULL,
	"email_enabled" boolean DEFAULT true NOT NULL,
	"push_enabled" boolean DEFAULT true NOT NULL,
	"in_app_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"expiration_time" double precision,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"level" varchar NOT NULL,
	"resource" varchar NOT NULL,
	"action" varchar NOT NULL,
	"description" varchar(255),
	"metadata" jsonb,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_name" "RoleEnum" DEFAULT 'USER' NOT NULL,
	"description" varchar(255),
	"metadata" jsonb
);

CREATE TABLE "role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"assigned_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" varchar(255),
	"role" varchar(255) NOT NULL,
	"banned" boolean DEFAULT false,
	"ban_reason" varchar(255),
	"ban_expires" timestamp (3) with time zone,
	"timezone" varchar(50) DEFAULT 'UTC' NOT NULL,
	"locale" varchar(10) DEFAULT 'en-US' NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "user_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" uuid,
	"ip_address" varchar(45),
	"user_agent" text,
	"login_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"logout_at" timestamp (3) with time zone,
	"last_seen_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp (6) with time zone,
	"refresh_token_expires_at" timestamp (6) with time zone,
	"scope" text,
	"password" text,
	"user_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(512) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"mime_type" varchar(127) NOT NULL,
	"size" bigint NOT NULL,
	"url" varchar NOT NULL,
	"uploaded_by" uuid,
	"entity_type" varchar(50),
	"entity_id" uuid,
	"uploaded_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp (3) with time zone,
	"deleted_by" uuid
);

CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"impersonated_by" varchar(255),
	"user_id" uuid NOT NULL,
	"expires_at" timestamp (6) with time zone NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp (3) with time zone NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "contact_submission_replies" ADD CONSTRAINT "contact_submission_reply_submission_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."contact_submissions"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "contact_submission_replies" ADD CONSTRAINT "contact_submission_reply_replied_by_fkey" FOREIGN KEY ("replied_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscription_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permission_role_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permission_permission_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "user_roles" ADD CONSTRAINT "fk_user_roles_role_id" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "user_roles" ADD CONSTRAINT "fk_user_roles_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activity_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activity_session_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "files" ADD CONSTRAINT "files_user_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;
ALTER TABLE "files" ADD CONSTRAINT "files_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
CREATE INDEX "contact_submission_email_idx" ON "contact_submissions" USING btree ("email");
CREATE INDEX "contact_submission_status_idx" ON "contact_submissions" USING btree ("status");
CREATE INDEX "contact_submission_created_at_idx" ON "contact_submissions" USING btree ("created_at");
CREATE INDEX "contact_submission_reply_submission_id_idx" ON "contact_submission_replies" USING btree ("submission_id");
CREATE INDEX "contact_submission_reply_replied_by_idx" ON "contact_submission_replies" USING btree ("replied_by");
CREATE INDEX "notifications_recipient_idx" ON "notifications" USING btree ("recipient_id");
CREATE INDEX "notifications_recipient_read_idx" ON "notifications" USING btree ("recipient_id","is_read");
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");
CREATE UNIQUE INDEX "notification_settings_user_category_key" ON "notification_settings" USING btree ("user_id","category");
CREATE UNIQUE INDEX "push_subscription_endpoint_unique" ON "push_subscriptions" USING btree ("endpoint");
CREATE INDEX "push_subscription_user_id" ON "push_subscriptions" USING btree ("user_id");
CREATE UNIQUE INDEX "permission_level_resource_action_key" ON "permissions" USING btree ("level","resource","action");
CREATE INDEX "permission_level_idx" ON "permissions" USING btree ("level");
CREATE INDEX "permission_resource_idx" ON "permissions" USING btree ("resource");
CREATE INDEX "permission_action_idx" ON "permissions" USING btree ("action");
CREATE UNIQUE INDEX "role_name_unique" ON "roles" USING btree ("role_name");
CREATE UNIQUE INDEX "role_permission_unique" ON "role_permissions" USING btree ("role_id","permission_id");
CREATE INDEX "role_permission_role_idx" ON "role_permissions" USING btree ("role_id");
CREATE INDEX "role_permission_permission_idx" ON "role_permissions" USING btree ("permission_id");
CREATE INDEX "user_role_unique" ON "user_roles" USING btree ("user_id","role_id");
CREATE INDEX "user_role_role_id_idx" ON "user_roles" USING btree ("role_id");
CREATE INDEX "user_role_user_id_idx" ON "user_roles" USING btree ("user_id");
CREATE UNIQUE INDEX "user_email_key" ON "users" USING btree ("email");
CREATE INDEX "user_activity_user_id_idx" ON "user_activities" USING btree ("user_id");
CREATE INDEX "user_activity_login_at_idx" ON "user_activities" USING btree ("login_at");
CREATE INDEX "session_activity_last_seen_at_idx" ON "user_activities" USING btree ("last_seen_at");
CREATE UNIQUE INDEX "account_provider_account_id_key" ON "accounts" USING btree ("provider_id","account_id");
CREATE INDEX "account_user_id_idx" ON "accounts" USING btree ("user_id");
CREATE INDEX "files_user_idx" ON "files" USING btree ("uploaded_by");
CREATE INDEX "files_deleted_by_idx" ON "files" USING btree ("deleted_by");
CREATE INDEX "files_entity_idx" ON "files" USING btree ("entity_type","entity_id");
CREATE INDEX "files_key_idx" ON "files" USING btree ("key");
CREATE INDEX "files_uploaded_at_idx" ON "files" USING btree ("uploaded_at");
CREATE UNIQUE INDEX "session_token_key" ON "sessions" USING btree ("token");
CREATE INDEX "session_user_id_idx" ON "sessions" USING btree ("user_id");
CREATE INDEX "session_expires_at_idx" ON "sessions" USING btree ("expires_at");
