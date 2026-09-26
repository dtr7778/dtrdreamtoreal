◇ injected env (6) from ../../.env // tip: ◈ encrypted .env [www.dotenvx.com]
CREATE TYPE "public"."AddressTypeEnum" AS ENUM('billing', 'shipping', 'office', 'home', 'work', 'other');
CREATE TYPE "public"."AuditItemStatusEnum" AS ENUM('pending', 'running', 'passed', 'failed', 'warning', 'needs_review', 'error', 'skipped');
CREATE TYPE "public"."AuditStatusEnum" AS ENUM('pending', 'running', 'completed', 'failed', 'partial', 'cancelled');
CREATE TYPE "public"."ContactStatusEnum" AS ENUM('pending', 'processing', 'replied', 'closed', 'spam');
CREATE TYPE "public"."CwvSourceEnum" AS ENUM('psi', 'crux', 'crux_history', 'bigquery');
CREATE TYPE "public"."CwvStrategyEnum" AS ENUM('phone', 'desktop');
CREATE TYPE "public"."EmailDirectionEnum" AS ENUM('outbound', 'inbound', 'web_form');
CREATE TYPE "public"."EmailEventTypeEnum" AS ENUM('email.sent', 'email.delivered', 'email.delivery_delayed', 'email.bounced', 'email.complained', 'email.opened', 'email.clicked', 'email.unsubscribed', 'email.rejected');
CREATE TYPE "public"."EmailRecipientTypeEnum" AS ENUM('to', 'cc', 'bcc', 'reply_to', 'from', 'received_for');
CREATE TYPE "public"."EmailStatusEnum" AS ENUM('draft', 'queued', 'sent', 'received', 'delivered', 'delivery_delayed', 'bounced', 'complained', 'suppressed', 'failed');
CREATE TYPE "public"."NotificationCategoryEnum" AS ENUM('SYSTEM', 'AUTH', 'SUPPORT', 'LEAD');
CREATE TYPE "public"."NotificationLevelEnum" AS ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR');
CREATE TYPE "public"."RoleEnum" AS ENUM('USER', 'SUPPORT_AGENT', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE "public"."SocialMediaPlatfromTypeEnum" AS ENUM('X', 'linkedin', 'facebook', 'instagram', 'youtube', 'tiktok', 'other');
CREATE TYPE "public"."SocialMediaTypeEnum" AS ENUM('person', 'company');
CREATE TYPE "public"."TaskPriorityEnum" AS ENUM('low', 'medium', 'high');
CREATE TYPE "public"."TaskStatusEnum" AS ENUM('todo', 'in_progress', 'done', 'cancelled');
CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email_thread_id" uuid NOT NULL,
	"contact_user_id" uuid NOT NULL,
	"subject" varchar,
	"message" varchar NOT NULL,
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

CREATE TABLE "contact_submission_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"replied_by" uuid NOT NULL,
	"email_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);

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

CREATE TABLE "email_recipients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email_id" uuid NOT NULL,
	"type" "EmailRecipientTypeEnum" NOT NULL,
	"email" varchar NOT NULL,
	"name" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);

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

CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"legal_name" varchar(255),
	"website" varchar(500),
	"industry" varchar(100),
	"employ_size" varchar(50),
	"email" varchar(255),
	"phone" varchar(50),
	"description" text,
	"context" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "company_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"address_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT true NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "company_ai_usages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"ai_usage_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "company_email_threads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"email_thread_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "company_socials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"social_media_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"first_name" varchar NOT NULL,
	"middle_name" varchar,
	"last_name" varchar,
	"email" varchar(256),
	"phone" varchar(50),
	"job_title" varchar(256),
	"department" varchar(100),
	"website" varchar(500),
	"created_by" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "employee_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"address_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT true NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "employee_email_threads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"email_thread_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "employee_socials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"social_media_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
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

CREATE TABLE "addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "AddressTypeEnum" DEFAULT 'other' NOT NULL,
	"street_line_1" varchar(255) NOT NULL,
	"street_line_2" varchar(255),
	"city" varchar(100) NOT NULL,
	"state" varchar(100),
	"zip_code" varchar(20) NOT NULL,
	"country" varchar(100) NOT NULL,
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"notes" text,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);

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

CREATE TABLE "social_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "SocialMediaTypeEnum" NOT NULL,
	"platform" "SocialMediaPlatfromTypeEnum" NOT NULL,
	"username" varchar(256) NOT NULL,
	"url" varchar NOT NULL,
	"display_name" varchar(256),
	"notes" text,
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

ALTER TABLE "contact_submissions" ADD CONSTRAINT "contactSubmission_contactUser_fkey" FOREIGN KEY ("contact_user_id") REFERENCES "public"."contact_users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "contact_submissions" ADD CONSTRAINT "contactSubmission_emailThread_fkey" FOREIGN KEY ("email_thread_id") REFERENCES "public"."email_threads"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "contact_submission_replies" ADD CONSTRAINT "contactSubmissionReply_submission_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."contact_submissions"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "contact_submission_replies" ADD CONSTRAINT "contactSubmissionReply_repliedBy_fkey" FOREIGN KEY ("replied_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "contact_submission_replies" ADD CONSTRAINT "contactSubmissionReply_emailId_fkey" FOREIGN KEY ("email_id") REFERENCES "public"."emails"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "emails" ADD CONSTRAINT "email_emailThread_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."email_threads"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "email_attachments" ADD CONSTRAINT "emailAttachment_emailId_fkey" FOREIGN KEY ("email_id") REFERENCES "public"."emails"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "email_recipients" ADD CONSTRAINT "emailRecipient_email_fkey" FOREIGN KEY ("email_id") REFERENCES "public"."emails"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "email_threads" ADD CONSTRAINT "emailThread_closedBy_fkey" FOREIGN KEY ("closed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "companies" ADD CONSTRAINT "company_createdBy_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "company_addresses" ADD CONSTRAINT "companyAddress_companyId_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "company_addresses" ADD CONSTRAINT "companyAddress_addressId_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "company_ai_usages" ADD CONSTRAINT "companyAiUsage_companyId_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "company_ai_usages" ADD CONSTRAINT "companyAiUsage_aiUsageId_fkey" FOREIGN KEY ("ai_usage_id") REFERENCES "public"."ai_usages"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "company_email_threads" ADD CONSTRAINT "companyEmailThread_companyId_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "company_email_threads" ADD CONSTRAINT "companyEmailThread_emailThreadId_fkey" FOREIGN KEY ("email_thread_id") REFERENCES "public"."email_threads"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "company_socials" ADD CONSTRAINT "companySocial_companyId_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "company_socials" ADD CONSTRAINT "companySocial_socialMediaId_fkey" FOREIGN KEY ("social_media_id") REFERENCES "public"."social_media"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "employees" ADD CONSTRAINT "employee_companyId_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "employees" ADD CONSTRAINT "employee_createdBy_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "employee_addresses" ADD CONSTRAINT "employeeAddress_employeeId_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "employee_addresses" ADD CONSTRAINT "employeeAddress_addressId_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "employee_email_threads" ADD CONSTRAINT "employeeEmailThread_employeeId_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "employee_email_threads" ADD CONSTRAINT "employeeEmailThread_emailThreadId_fkey" FOREIGN KEY ("email_thread_id") REFERENCES "public"."email_threads"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "employee_socials" ADD CONSTRAINT "employeeSocial_employeeId_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "employee_socials" ADD CONSTRAINT "employeeSocial_socialMediaId_fkey" FOREIGN KEY ("social_media_id") REFERENCES "public"."social_media"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permission_role_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permission_permission_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "user_roles" ADD CONSTRAINT "fk_user_roles_role_id" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "user_roles" ADD CONSTRAINT "fk_user_roles_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "audit_items" ADD CONSTRAINT "auditItem_siteAudit_fkey" FOREIGN KEY ("site_audit_id") REFERENCES "public"."site_audits"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "cwv_snapshots" ADD CONSTRAINT "cwvSnapshot_siteAudit_fkey" FOREIGN KEY ("site_audit_id") REFERENCES "public"."site_audits"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "site_audits" ADD CONSTRAINT "siteAudit_company_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "site_audits" ADD CONSTRAINT "siteAudit_triggerdBy_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activity_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activity_session_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscription_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "accounts" ADD CONSTRAINT "account_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "ai_usages" ADD CONSTRAINT "ai_usage_createdBy_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "files" ADD CONSTRAINT "file_user_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;
ALTER TABLE "files" ADD CONSTRAINT "file_deletedBy_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;
ALTER TABLE "sessions" ADD CONSTRAINT "session_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;
CREATE INDEX "contactSubmission_contactUserId_idx" ON "contact_submissions" USING btree ("contact_user_id");
CREATE UNIQUE INDEX "contactSubmission_emailThreadId_idx" ON "contact_submissions" USING btree ("email_thread_id");
CREATE INDEX "contactSubmission_status_idx" ON "contact_submissions" USING btree ("status");
CREATE INDEX "contactSubmission_createdAt_idx" ON "contact_submissions" USING btree ("created_at");
CREATE INDEX "contactSubmissionReply_submissionId_idx" ON "contact_submission_replies" USING btree ("submission_id");
CREATE INDEX "contactSubmissionReply_repliedBy_idx" ON "contact_submission_replies" USING btree ("replied_by");
CREATE UNIQUE INDEX "contactSubmissionReply_emailId_idx" ON "contact_submission_replies" USING btree ("email_id");
CREATE INDEX "contactSubmissionReply_createdAt_idx" ON "contact_submission_replies" USING btree ("created_at");
CREATE UNIQUE INDEX "contactUser_email_idx" ON "contact_users" USING btree ("email");
CREATE INDEX "contactUser_name_idx" ON "contact_users" USING btree ("name");
CREATE INDEX "contactUser_createdAt_idx" ON "contact_users" USING btree ("created_at");
CREATE INDEX "email_emailThreadId_idx" ON "emails" USING btree ("thread_id");
CREATE UNIQUE INDEX "email_resendId_idx" ON "emails" USING btree ("resend_id");
CREATE UNIQUE INDEX "email_qMessageId_idx" ON "emails" USING btree ("q_message_id");
CREATE INDEX "email_messageId_idx" ON "emails" USING btree ("resend_message_id");
CREATE INDEX "email_direction_idx" ON "emails" USING btree ("direction");
CREATE INDEX "email_status_idx" ON "emails" USING btree ("status");
CREATE INDEX "email_createdAt_idx" ON "emails" USING btree ("created_at");
CREATE INDEX "emailAttachment_emailId_idx" ON "email_attachments" USING btree ("email_id");
CREATE INDEX "emailAttachment_contentId_idx" ON "email_attachments" USING btree ("content_id");
CREATE INDEX "emailRecipient_emailId_idx" ON "email_recipients" USING btree ("email_id");
CREATE INDEX "emailRecipient_email_idx" ON "email_recipients" USING btree ("email");
CREATE INDEX "emailRecipient_type_idx" ON "email_recipients" USING btree ("type");
CREATE INDEX "emailThread_closedBy_idx" ON "email_threads" USING btree ("closed_by");
CREATE INDEX "emailThread_contactEmail_idx" ON "email_threads" USING btree ("contact_email");
CREATE INDEX "emailThread_isClosed_idx" ON "email_threads" USING btree ("is_closed");
CREATE INDEX "companies_createdBy_idx" ON "companies" USING btree ("created_by");
CREATE INDEX "companies_name_idx" ON "companies" USING btree ("name");
CREATE INDEX "companyAddress_companyId_idx" ON "company_addresses" USING btree ("company_id");
CREATE INDEX "companyAddress_addressId_idx" ON "company_addresses" USING btree ("address_id");
CREATE INDEX "companyAiUsage_companyId_idx" ON "company_ai_usages" USING btree ("company_id");
CREATE INDEX "companyAiUsage_aiUsageId_idx" ON "company_ai_usages" USING btree ("ai_usage_id");
CREATE INDEX "companyEmailThread_companyId_idx" ON "company_email_threads" USING btree ("company_id");
CREATE INDEX "companyEmailThread_emailThreadId_idx" ON "company_email_threads" USING btree ("email_thread_id");
CREATE INDEX "companySocial_companyId_idx" ON "company_socials" USING btree ("company_id");
CREATE INDEX "companySocial_socialMediaId_idx" ON "company_socials" USING btree ("social_media_id");
CREATE INDEX "employee_companyId_idx" ON "employees" USING btree ("company_id");
CREATE INDEX "employee_createdBy_idx" ON "employees" USING btree ("created_by");
CREATE INDEX "employeeAddress_employeeId_idx" ON "employee_addresses" USING btree ("employee_id");
CREATE INDEX "employeeAddress_addressId_idx" ON "employee_addresses" USING btree ("address_id");
CREATE INDEX "employeeEmailThread_employeeId_idx" ON "employee_email_threads" USING btree ("employee_id");
CREATE INDEX "employeeEmailThread_emailThreadId_idx" ON "employee_email_threads" USING btree ("email_thread_id");
CREATE INDEX "employeeSocial_employeeId_idx" ON "employee_socials" USING btree ("employee_id");
CREATE INDEX "employeeSocial_socialMediaId_idx" ON "employee_socials" USING btree ("social_media_id");
CREATE INDEX "notifications_recipient_idx" ON "notifications" USING btree ("recipient_id");
CREATE INDEX "notifications_recipient_read_idx" ON "notifications" USING btree ("recipient_id","is_read");
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");
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
CREATE INDEX "auditItem_siteAuditId_idx" ON "audit_items" USING btree ("site_audit_id");
CREATE INDEX "auditItem_checklistKey_idx" ON "audit_items" USING btree ("checklist_key");
CREATE INDEX "auditItem_status_idx" ON "audit_items" USING btree ("status");
CREATE INDEX "auditItem_url_idx" ON "audit_items" USING btree ("url");
CREATE INDEX "cwvSnapshot_siteAuditId_idx" ON "cwv_snapshots" USING btree ("site_audit_id");
CREATE INDEX "cwvSnapshot_url_idx" ON "cwv_snapshots" USING btree ("url");
CREATE INDEX "cwvSnapshot_strategy_idx" ON "cwv_snapshots" USING btree ("strategy");
CREATE INDEX "cwvSnapshot_source_idx" ON "cwv_snapshots" USING btree ("source");
CREATE INDEX "cwvSnapshot_countryCode_idx" ON "cwv_snapshots" USING btree ("country_code");
CREATE INDEX "siteAudit_companyId_idx" ON "site_audits" USING btree ("company_id");
CREATE INDEX "siteAudit_triggeredBy_idx" ON "site_audits" USING btree ("triggered_by");
CREATE INDEX "siteAudit_createdAt_idx" ON "site_audits" USING btree ("created_at");
CREATE UNIQUE INDEX "user_email_key" ON "users" USING btree ("email");
CREATE INDEX "user_activity_user_id_idx" ON "user_activities" USING btree ("user_id");
CREATE INDEX "user_activity_login_at_idx" ON "user_activities" USING btree ("login_at");
CREATE INDEX "session_activity_last_seen_at_idx" ON "user_activities" USING btree ("last_seen_at");
CREATE UNIQUE INDEX "notification_settings_user_category_key" ON "notification_settings" USING btree ("user_id","category");
CREATE UNIQUE INDEX "push_subscription_endpoint_unique" ON "push_subscriptions" USING btree ("endpoint");
CREATE INDEX "push_subscription_user_id" ON "push_subscriptions" USING btree ("user_id");
CREATE UNIQUE INDEX "account_accountProvider_accountId_idx" ON "accounts" USING btree ("provider_id","account_id");
CREATE INDEX "account_userId_idx" ON "accounts" USING btree ("user_id");
CREATE INDEX "ai_usages_createdBy_idx" ON "ai_usages" USING btree ("created_by");
CREATE INDEX "file_user_idx" ON "files" USING btree ("uploaded_by");
CREATE INDEX "file_deletedBy_idx" ON "files" USING btree ("deleted_by");
CREATE INDEX "file_entityType_idx" ON "files" USING btree ("entity_type","entity_id");
CREATE INDEX "file_key_idx" ON "files" USING btree ("key");
CREATE INDEX "file_uploadedAt_idx" ON "files" USING btree ("uploaded_at");
CREATE UNIQUE INDEX "session_token_idx" ON "sessions" USING btree ("token");
CREATE INDEX "session_userId_idx" ON "sessions" USING btree ("user_id");
CREATE INDEX "session_expiresAt_idx" ON "sessions" USING btree ("expires_at");
CREATE INDEX "socialMedia_userName_idx" ON "social_media" USING btree ("username");
CREATE INDEX "tasks_assigned_by_idx" ON "tasks" USING btree ("assigned_by");
CREATE INDEX "tasks_status_idx" ON "tasks" USING btree ("status");
CREATE INDEX "tasks_priority_idx" ON "tasks" USING btree ("priority");
CREATE INDEX "tasks_due_date_idx" ON "tasks" USING btree ("due_date");
CREATE INDEX "tasks_created_at_idx" ON "tasks" USING btree ("created_at");
