CREATE TYPE "public"."ContactStatusEnum" AS ENUM('pending', 'processing', 'replied', 'closed', 'spam');--> statement-breakpoint
CREATE TYPE "public"."EmailDirectionEnum" AS ENUM('outbound', 'inbound', 'web_form');--> statement-breakpoint
CREATE TYPE "public"."EmailEventTypeEnum" AS ENUM('email.sent', 'email.delivered', 'email.delivery_delayed', 'email.bounced', 'email.complained', 'email.opened', 'email.clicked', 'email.unsubscribed', 'email.rejected');--> statement-breakpoint
CREATE TYPE "public"."EmailRecipientTypeEnum" AS ENUM('to', 'cc', 'bcc', 'reply_to', 'from', 'received_for');--> statement-breakpoint
CREATE TYPE "public"."EmailStatusEnum" AS ENUM('draft', 'queued', 'sent', 'delivered', 'bounced', 'complained', 'failed');--> statement-breakpoint
CREATE TYPE "public"."NotificationCategoryEnum" AS ENUM('SYSTEM', 'AUTH', 'SUPPORT', 'LEAD');--> statement-breakpoint
CREATE TYPE "public"."NotificationLevelEnum" AS ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR');--> statement-breakpoint
CREATE TYPE "public"."RoleEnum" AS ENUM('USER', 'SUPPORT_AGENT', 'ADMIN', 'SUPER_ADMIN');--> statement-breakpoint
CREATE TYPE "public"."TaskPriorityEnum" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."TaskStatusEnum" AS ENUM('todo', 'in_progress', 'done', 'cancelled');--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_user_id" uuid NOT NULL,
	"subject" varchar,
	"message" text NOT NULL,
	"status" "ContactStatusEnum" DEFAULT 'pending' NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"metadata" jsonb,
	"notes" text,
	"is_spam" boolean DEFAULT false NOT NULL,
	"spam_reason" text,
	"read_at" timestamp (3) with time zone,
	"closed_at" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_submission_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"replied_by" uuid NOT NULL,
	"reply" text NOT NULL,
	"message_id" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"name" varchar(255),
	"first_name" varchar(100),
	"last_name" varchar(100),
	"phone" varchar(50),
	"company" varchar(255),
	"metadata" jsonb,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_email_joins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"email_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" uuid,
	"direction" "EmailDirectionEnum" NOT NULL,
	"status" "EmailStatusEnum" DEFAULT 'draft' NOT NULL,
	"resend_id" varchar,
	"resend_message_id" varchar,
	"q_message_id" varchar,
	"subject" varchar,
	"text_body" text,
	"html_body" text,
	"headers" jsonb,
	"metadata" jsonb,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email_id" uuid NOT NULL,
	"filename" varchar NOT NULL,
	"content_type" varchar NOT NULL,
	"content_id" varchar,
	"content_disposition" text,
	"size" integer,
	"storage_key" varchar,
	"url" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_recipients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email_id" uuid NOT NULL,
	"type" "EmailRecipientTypeEnum" NOT NULL,
	"email" varchar NOT NULL,
	"name" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_threads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject" varchar NOT NULL,
	"contact_email" varchar NOT NULL,
	"contact_name" varchar,
	"is_closed" boolean DEFAULT false NOT NULL,
	"closed_at" timestamp (3) with time zone,
	"closed_by" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_name" "RoleEnum" DEFAULT 'USER' NOT NULL,
	"description" varchar(255),
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"assigned_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp (3) with time zone NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" "TaskStatusEnum" DEFAULT 'todo' NOT NULL,
	"priority" "TaskPriorityEnum" DEFAULT 'medium' NOT NULL,
	"due_date" timestamp (3) with time zone,
	"assigned_by" uuid,
	"created_by" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact_submissions" ADD CONSTRAINT "contactSubmission_contactUser_fkey" FOREIGN KEY ("contact_user_id") REFERENCES "public"."contact_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_submission_replies" ADD CONSTRAINT "contactSubmissionReply_submission_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."contact_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_email_joins" ADD CONSTRAINT "contactEmailJoin_submission_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."contact_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_email_joins" ADD CONSTRAINT "contactEmailJoin_email_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."emails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails" ADD CONSTRAINT "email_emailThread_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."email_threads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_attachments" ADD CONSTRAINT "emailAttachment_emailId_fkey" FOREIGN KEY ("email_id") REFERENCES "public"."emails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_recipients" ADD CONSTRAINT "emailRecipient_email_fkey" FOREIGN KEY ("email_id") REFERENCES "public"."emails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_threads" ADD CONSTRAINT "emailThread_closedBy_fkey" FOREIGN KEY ("closed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permission_role_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permission_permission_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "fk_user_roles_role_id" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "fk_user_roles_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activity_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activity_session_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscription_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "account_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "file_user_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "file_deletedBy_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "session_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "contactSubmission_contactUser_idx" ON "contact_submissions" USING btree ("contact_user_id");--> statement-breakpoint
CREATE INDEX "contactSubmission_status_idx" ON "contact_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contactSubmission_createdAt_idx" ON "contact_submissions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "contactSubmissionReply_submissionId_idx" ON "contact_submission_replies" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "contactSubmissionReply_messageId_idx" ON "contact_submission_replies" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "contactSubmissionReply_createdAt_idx" ON "contact_submission_replies" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "contactUser_email_idx" ON "contact_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "contactUser_name_idx" ON "contact_users" USING btree ("name");--> statement-breakpoint
CREATE INDEX "contactUser_createdAt_idx" ON "contact_users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "contactEmailJoin_sumissionId_idx" ON "contact_email_joins" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "contactEmailJoin_emailId_idx" ON "contact_email_joins" USING btree ("email_id");--> statement-breakpoint
CREATE INDEX "email_emailThreadId_idx" ON "emails" USING btree ("thread_id");--> statement-breakpoint
CREATE UNIQUE INDEX "email_resendId_idx" ON "emails" USING btree ("resend_id");--> statement-breakpoint
CREATE UNIQUE INDEX "email_qMessageId_idx" ON "emails" USING btree ("q_message_id");--> statement-breakpoint
CREATE INDEX "email_messageId_idx" ON "emails" USING btree ("resend_message_id");--> statement-breakpoint
CREATE INDEX "email_direction_idx" ON "emails" USING btree ("direction");--> statement-breakpoint
CREATE INDEX "email_status_idx" ON "emails" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_createdAt_idx" ON "emails" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "emailAttachment_emailId_idx" ON "email_attachments" USING btree ("email_id");--> statement-breakpoint
CREATE INDEX "emailAttachment_contentId_idx" ON "email_attachments" USING btree ("content_id");--> statement-breakpoint
CREATE INDEX "emailRecipient_emailId_idx" ON "email_recipients" USING btree ("email_id");--> statement-breakpoint
CREATE INDEX "emailRecipient_email_idx" ON "email_recipients" USING btree ("email");--> statement-breakpoint
CREATE INDEX "emailRecipient_type_idx" ON "email_recipients" USING btree ("type");--> statement-breakpoint
CREATE INDEX "emailThread_closedBy_idx" ON "email_threads" USING btree ("closed_by");--> statement-breakpoint
CREATE INDEX "emailThread_contactEmail_idx" ON "email_threads" USING btree ("contact_email");--> statement-breakpoint
CREATE INDEX "emailThread_isClosed_idx" ON "email_threads" USING btree ("is_closed");--> statement-breakpoint
CREATE INDEX "notifications_recipient_idx" ON "notifications" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "notifications_recipient_read_idx" ON "notifications" USING btree ("recipient_id","is_read");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "permission_level_resource_action_key" ON "permissions" USING btree ("level","resource","action");--> statement-breakpoint
CREATE INDEX "permission_level_idx" ON "permissions" USING btree ("level");--> statement-breakpoint
CREATE INDEX "permission_resource_idx" ON "permissions" USING btree ("resource");--> statement-breakpoint
CREATE INDEX "permission_action_idx" ON "permissions" USING btree ("action");--> statement-breakpoint
CREATE UNIQUE INDEX "role_name_unique" ON "roles" USING btree ("role_name");--> statement-breakpoint
CREATE UNIQUE INDEX "role_permission_unique" ON "role_permissions" USING btree ("role_id","permission_id");--> statement-breakpoint
CREATE INDEX "role_permission_role_idx" ON "role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "role_permission_permission_idx" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX "user_role_unique" ON "user_roles" USING btree ("user_id","role_id");--> statement-breakpoint
CREATE INDEX "user_role_role_id_idx" ON "user_roles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "user_role_user_id_idx" ON "user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_key" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_activity_user_id_idx" ON "user_activities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_activity_login_at_idx" ON "user_activities" USING btree ("login_at");--> statement-breakpoint
CREATE INDEX "session_activity_last_seen_at_idx" ON "user_activities" USING btree ("last_seen_at");--> statement-breakpoint
CREATE UNIQUE INDEX "notification_settings_user_category_key" ON "notification_settings" USING btree ("user_id","category");--> statement-breakpoint
CREATE UNIQUE INDEX "push_subscription_endpoint_unique" ON "push_subscriptions" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "push_subscription_user_id" ON "push_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_accountProvider_accountId_idx" ON "accounts" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "file_user_idx" ON "files" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "file_deletedBy_idx" ON "files" USING btree ("deleted_by");--> statement-breakpoint
CREATE INDEX "file_entityType_idx" ON "files" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "file_key_idx" ON "files" USING btree ("key");--> statement-breakpoint
CREATE INDEX "file_uploadedAt_idx" ON "files" USING btree ("uploaded_at");--> statement-breakpoint
CREATE UNIQUE INDEX "session_token_idx" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_expiresAt_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "tasks_assigned_by_idx" ON "tasks" USING btree ("assigned_by");--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tasks_priority_idx" ON "tasks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "tasks_due_date_idx" ON "tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "tasks_created_at_idx" ON "tasks" USING btree ("created_at");