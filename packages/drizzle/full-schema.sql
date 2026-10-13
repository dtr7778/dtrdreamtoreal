◇ injected env (0) from .env // tip: ⌘ override existing { override: true }
CREATE TABLE `chat_rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`name` text,
	`description` text,
	`image_file_id` text,
	`created_by` text,
	`last_message_at` integer,
	`is_archived` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`image_file_id`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE INDEX `chatRoom_type_idx` ON `chat_rooms` (`type`);
CREATE INDEX `chatRoom_createdBy_idx` ON `chat_rooms` (`created_by`);
CREATE INDEX `chatRoom_lastMessageAt_idx` ON `chat_rooms` (`last_message_at`);
CREATE INDEX `chatRoom_isArchived_idx` ON `chat_rooms` (`is_archived`);
CREATE TABLE `chat_room_members` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`is_muted` integer DEFAULT false NOT NULL,
	`last_read_message_id` text,
	`last_read_at` integer,
	`joined_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `chat_rooms`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`last_read_message_id`) REFERENCES `chat_messages`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE UNIQUE INDEX `chatRoomMember_roomId_userId_key` ON `chat_room_members` (`room_id`,`user_id`);
CREATE INDEX `chatRoomMember_roomId_idx` ON `chat_room_members` (`room_id`);
CREATE INDEX `chatRoomMember_userId_idx` ON `chat_room_members` (`user_id`);
CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`sender_id` text,
	`type` text DEFAULT 'text' NOT NULL,
	`body` text,
	`parent_message_id` text,
	`reply_to_message_id` text,
	`thread_reply_count` integer DEFAULT 0 NOT NULL,
	`last_reply_at` integer,
	`edited_at` integer,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `chat_rooms`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`parent_message_id`) REFERENCES `chat_messages`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reply_to_message_id`) REFERENCES `chat_messages`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE INDEX `chatMessage_roomId_idx` ON `chat_messages` (`room_id`);
CREATE INDEX `chatMessage_senderId_idx` ON `chat_messages` (`sender_id`);
CREATE INDEX `chatMessage_parentMessageId_idx` ON `chat_messages` (`parent_message_id`);
CREATE INDEX `chatMessage_replyToMessageId_idx` ON `chat_messages` (`reply_to_message_id`);
CREATE INDEX `chatMessage_roomId_createdAt_idx` ON `chat_messages` (`room_id`,`created_at`);
CREATE INDEX `chatMessage_createdAt_idx` ON `chat_messages` (`created_at`);
CREATE TABLE `chat_message_reactions` (
	`id` text PRIMARY KEY NOT NULL,
	`message_id` text NOT NULL,
	`user_id` text NOT NULL,
	`emoji` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`message_id`) REFERENCES `chat_messages`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `chatMessageReaction_messageId_userId_emoji_key` ON `chat_message_reactions` (`message_id`,`user_id`,`emoji`);
CREATE INDEX `chatMessageReaction_messageId_idx` ON `chat_message_reactions` (`message_id`);
CREATE INDEX `chatMessageReaction_userId_idx` ON `chat_message_reactions` (`user_id`);
CREATE TABLE `chat_message_attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`message_id` text NOT NULL,
	`file_id` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`message_id`) REFERENCES `chat_messages`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `chatMessageAttachment_messageId_fileId_key` ON `chat_message_attachments` (`message_id`,`file_id`);
CREATE INDEX `chatMessageAttachment_messageId_idx` ON `chat_message_attachments` (`message_id`);
CREATE INDEX `chatMessageAttachment_fileId_idx` ON `chat_message_attachments` (`file_id`);
CREATE TABLE `contact_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`email_thread_id` text NOT NULL,
	`contact_user_id` text NOT NULL,
	`subject` text,
	`message` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`notes` text,
	`is_spam` integer DEFAULT false NOT NULL,
	`spam_reason` text,
	`read_at` integer,
	`closed_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`contact_user_id`) REFERENCES `contact_users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`email_thread_id`) REFERENCES `email_threads`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `contactSubmission_contactUserId_idx` ON `contact_submissions` (`contact_user_id`);
CREATE UNIQUE INDEX `contactSubmission_emailThreadId_idx` ON `contact_submissions` (`email_thread_id`);
CREATE INDEX `contactSubmission_status_idx` ON `contact_submissions` (`status`);
CREATE INDEX `contactSubmission_createdAt_idx` ON `contact_submissions` (`created_at`);
CREATE TABLE `contact_submission_replies` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`replied_by` text NOT NULL,
	`email_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`submission_id`) REFERENCES `contact_submissions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`replied_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`email_id`) REFERENCES `emails`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `contactSubmissionReply_submissionId_idx` ON `contact_submission_replies` (`submission_id`);
CREATE INDEX `contactSubmissionReply_repliedBy_idx` ON `contact_submission_replies` (`replied_by`);
CREATE UNIQUE INDEX `contactSubmissionReply_emailId_idx` ON `contact_submission_replies` (`email_id`);
CREATE INDEX `contactSubmissionReply_createdAt_idx` ON `contact_submission_replies` (`created_at`);
CREATE TABLE `contact_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`first_name` text NOT NULL,
	`middle_name` text,
	`last_name` text,
	`phone` text,
	`company` text,
	`is_blocked` integer DEFAULT false NOT NULL,
	`blocked_reason` text,
	`spam_count` integer DEFAULT 0 NOT NULL,
	`submission_count` integer DEFAULT 0 NOT NULL,
	`last_submitted_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);

CREATE UNIQUE INDEX `contactUser_email_idx` ON `contact_users` (`email`);
CREATE INDEX `contactUser_firstName_idx` ON `contact_users` (`first_name`);
CREATE INDEX `contactUser_createdAt_idx` ON `contact_users` (`created_at`);
CREATE INDEX `contactUser_isBlocked_idx` ON `contact_users` (`is_blocked`);
CREATE TABLE `emails` (
	`id` text PRIMARY KEY NOT NULL,
	`thread_id` text,
	`direction` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`resend_id` text,
	`resend_message_id` text,
	`q_message_id` text,
	`subject` text,
	`text_body` text,
	`html_body` text,
	`headers` text,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`thread_id`) REFERENCES `email_threads`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE INDEX `email_emailThreadId_idx` ON `emails` (`thread_id`);
CREATE UNIQUE INDEX `email_resendId_idx` ON `emails` (`resend_id`);
CREATE UNIQUE INDEX `email_qMessageId_idx` ON `emails` (`q_message_id`);
CREATE INDEX `email_messageId_idx` ON `emails` (`resend_message_id`);
CREATE INDEX `email_direction_idx` ON `emails` (`direction`);
CREATE INDEX `email_status_idx` ON `emails` (`status`);
CREATE INDEX `email_createdAt_idx` ON `emails` (`created_at`);
CREATE TABLE `email_attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`email_id` text NOT NULL,
	`filename` text NOT NULL,
	`content_type` text NOT NULL,
	`content_id` text,
	`content_disposition` text,
	`size` integer,
	`storage_key` text,
	`url` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`email_id`) REFERENCES `emails`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `emailAttachment_emailId_idx` ON `email_attachments` (`email_id`);
CREATE INDEX `emailAttachment_contentId_idx` ON `email_attachments` (`content_id`);
CREATE TABLE `email_recipients` (
	`id` text PRIMARY KEY NOT NULL,
	`email_id` text NOT NULL,
	`type` text NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`email_id`) REFERENCES `emails`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `emailRecipient_emailId_idx` ON `email_recipients` (`email_id`);
CREATE INDEX `emailRecipient_email_idx` ON `email_recipients` (`email`);
CREATE INDEX `emailRecipient_type_idx` ON `email_recipients` (`type`);
CREATE TABLE `email_threads` (
	`id` text PRIMARY KEY NOT NULL,
	`subject` text NOT NULL,
	`contact_email` text NOT NULL,
	`contact_name` text,
	`is_closed` integer DEFAULT false NOT NULL,
	`closed_at` integer,
	`closed_by` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`closed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE INDEX `emailThread_closedBy_idx` ON `email_threads` (`closed_by`);
CREATE INDEX `emailThread_contactEmail_idx` ON `email_threads` (`contact_email`);
CREATE INDEX `emailThread_isClosed_idx` ON `email_threads` (`is_closed`);
CREATE TABLE `lead_companies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`legal_name` text,
	`website` text,
	`industry` text,
	`employ_size` text,
	`email` text,
	`phone` text,
	`description` text,
	`context` text DEFAULT '{}' NOT NULL,
	`source` text NOT NULL,
	`external_id` text,
	`created_by` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE INDEX `leadCompany_createdBy_idx` ON `lead_companies` (`created_by`);
CREATE INDEX `leadCompany_name_idx` ON `lead_companies` (`name`);
CREATE UNIQUE INDEX `leadCompany_source_externalId_idx` ON `lead_companies` (`source`,`external_id`);
CREATE TABLE `lead_company_addresses` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_company_id` text NOT NULL,
	`address_id` text NOT NULL,
	`is_primary` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`lead_company_id`) REFERENCES `lead_companies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`address_id`) REFERENCES `addresses`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `leadCompanyAddress_leadCompanyId_idx` ON `lead_company_addresses` (`lead_company_id`);
CREATE INDEX `leadCompanyAddress_addressId_idx` ON `lead_company_addresses` (`address_id`);
CREATE TABLE `lead_company_ai_usages` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_company_id` text NOT NULL,
	`ai_usage_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`lead_company_id`) REFERENCES `lead_companies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ai_usage_id`) REFERENCES `ai_usages`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `leadCompanyAiUsage_leadCompanyId_idx` ON `lead_company_ai_usages` (`lead_company_id`);
CREATE INDEX `leadCompanyAiUsage_aiUsageId_idx` ON `lead_company_ai_usages` (`ai_usage_id`);
CREATE TABLE `lead_company_email_threads` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_company_id` text NOT NULL,
	`email_thread_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`lead_company_id`) REFERENCES `lead_companies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`email_thread_id`) REFERENCES `email_threads`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `leadCompanyEmailThread_leadCompanyId_idx` ON `lead_company_email_threads` (`lead_company_id`);
CREATE INDEX `leadCompanyEmailThread_emailThreadId_idx` ON `lead_company_email_threads` (`email_thread_id`);
CREATE TABLE `lead_company_socials` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_company_id` text NOT NULL,
	`social_media_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`lead_company_id`) REFERENCES `lead_companies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`social_media_id`) REFERENCES `social_media`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `leadCompanySocial_leadCompanyId_idx` ON `lead_company_socials` (`lead_company_id`);
CREATE INDEX `leadCompanySocial_socialMediaId_idx` ON `lead_company_socials` (`social_media_id`);
CREATE TABLE `lead_users` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_company_id` text,
	`first_name` text NOT NULL,
	`middle_name` text,
	`last_name` text,
	`email` text,
	`phone` text,
	`job_title` text,
	`department` text,
	`website` text,
	`source` text NOT NULL,
	`external_id` text,
	`created_by` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`lead_company_id`) REFERENCES `lead_companies`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE INDEX `leadUser_leadCompanyId_idx` ON `lead_users` (`lead_company_id`);
CREATE INDEX `leadUser_createdBy_idx` ON `lead_users` (`created_by`);
CREATE UNIQUE INDEX `leadUser_source_externalId_idx` ON `lead_users` (`source`,`external_id`);
CREATE TABLE `lead_user_addresses` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_user_id` text NOT NULL,
	`address_id` text NOT NULL,
	`is_primary` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`lead_user_id`) REFERENCES `lead_users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`address_id`) REFERENCES `addresses`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `leadUserAddress_leadUserId_idx` ON `lead_user_addresses` (`lead_user_id`);
CREATE INDEX `leadUserAddress_addressId_idx` ON `lead_user_addresses` (`address_id`);
CREATE TABLE `lead_user_email_threads` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_user_id` text NOT NULL,
	`email_thread_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`lead_user_id`) REFERENCES `lead_users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`email_thread_id`) REFERENCES `email_threads`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `leadUserEmailThread_leadUserId_idx` ON `lead_user_email_threads` (`lead_user_id`);
CREATE INDEX `leadUserEmailThread_emailThreadId_idx` ON `lead_user_email_threads` (`email_thread_id`);
CREATE TABLE `lead_user_socials` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_user_id` text NOT NULL,
	`social_media_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`lead_user_id`) REFERENCES `lead_users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`social_media_id`) REFERENCES `social_media`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `leadUserSocial_leadUserId_idx` ON `lead_user_socials` (`lead_user_id`);
CREATE INDEX `leadUserSocial_socialMediaId_idx` ON `lead_user_socials` (`social_media_id`);
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`recipient_id` text NOT NULL,
	`actor_id` text,
	`category` text NOT NULL,
	`level` text DEFAULT 'INFO' NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`data` text,
	`is_read` integer DEFAULT false NOT NULL,
	`read_at` integer,
	`is_archived` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE INDEX `notifications_recipient_idx` ON `notifications` (`recipient_id`);
CREATE INDEX `notifications_recipient_read_idx` ON `notifications` (`recipient_id`,`is_read`);
CREATE INDEX `notifications_created_at_idx` ON `notifications` (`created_at`);
CREATE TABLE `permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`level` text NOT NULL,
	`resource` text NOT NULL,
	`action` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);

CREATE UNIQUE INDEX `permission_level_resource_action_key` ON `permissions` (`level`,`resource`,`action`);
CREATE INDEX `permission_level_idx` ON `permissions` (`level`);
CREATE INDEX `permission_resource_idx` ON `permissions` (`resource`);
CREATE INDEX `permission_action_idx` ON `permissions` (`action`);
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`role_name` text DEFAULT 'USER' NOT NULL,
	`description` text
);

CREATE UNIQUE INDEX `role_name_unique` ON `roles` (`role_name`);
CREATE TABLE `role_permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`role_id` text NOT NULL,
	`permission_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `role_permission_unique` ON `role_permissions` (`role_id`,`permission_id`);
CREATE INDEX `role_permission_role_idx` ON `role_permissions` (`role_id`);
CREATE INDEX `role_permission_permission_idx` ON `role_permissions` (`permission_id`);
CREATE TABLE `user_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`role_id` text NOT NULL,
	`user_id` text NOT NULL,
	`assigned_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `user_role_unique` ON `user_roles` (`user_id`,`role_id`);
CREATE INDEX `user_role_role_id_idx` ON `user_roles` (`role_id`);
CREATE INDEX `user_role_user_id_idx` ON `user_roles` (`user_id`);
CREATE TABLE `audit_items` (
	`id` text PRIMARY KEY NOT NULL,
	`site_audit_id` text NOT NULL,
	`checklist_key` text NOT NULL,
	`section` text NOT NULL,
	`title` text NOT NULL,
	`url` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`message` text,
	`evidence` text,
	`duration_ms` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`site_audit_id`) REFERENCES `site_audits`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `auditItem_siteAuditId_idx` ON `audit_items` (`site_audit_id`);
CREATE INDEX `auditItem_checklistKey_idx` ON `audit_items` (`checklist_key`);
CREATE INDEX `auditItem_status_idx` ON `audit_items` (`status`);
CREATE INDEX `auditItem_url_idx` ON `audit_items` (`url`);
CREATE UNIQUE INDEX `auditItem_site_checklist_url_unq` ON `audit_items` (`site_audit_id`,`checklist_key`,`url`);
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`site_audit_id` text NOT NULL,
	`sequence` integer NOT NULL,
	`type` text NOT NULL,
	`level` text DEFAULT 'info' NOT NULL,
	`message` text NOT NULL,
	`data` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`site_audit_id`) REFERENCES `site_audits`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `auditLog_siteAuditId_sequence_uq` ON `audit_logs` (`site_audit_id`,`sequence`);
CREATE INDEX `auditLog_siteAuditId_idx` ON `audit_logs` (`site_audit_id`);
CREATE INDEX `auditLog_type_idx` ON `audit_logs` (`type`);
CREATE INDEX `auditLog_level_idx` ON `audit_logs` (`level`);
CREATE TABLE `cwv_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`site_audit_id` text NOT NULL,
	`url` text NOT NULL,
	`strategy` text NOT NULL,
	`source` text NOT NULL,
	`lcp` real,
	`inp` real,
	`cls` real,
	`ttfb` real,
	`fcp` real,
	`performance_score` real,
	`country_code` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`site_audit_id`) REFERENCES `site_audits`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `cwvSnapshot_siteAuditId_idx` ON `cwv_snapshots` (`site_audit_id`);
CREATE INDEX `cwvSnapshot_url_idx` ON `cwv_snapshots` (`url`);
CREATE INDEX `cwvSnapshot_strategy_idx` ON `cwv_snapshots` (`strategy`);
CREATE INDEX `cwvSnapshot_source_idx` ON `cwv_snapshots` (`source`);
CREATE INDEX `cwvSnapshot_countryCode_idx` ON `cwv_snapshots` (`country_code`);
CREATE TABLE `site_audits` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`url` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`report_image_file_id` text,
	`error` text,
	`total_items` integer DEFAULT 0 NOT NULL,
	`completed_items` integer DEFAULT 0 NOT NULL,
	`passed_items` integer DEFAULT 0 NOT NULL,
	`failed_items` integer DEFAULT 0 NOT NULL,
	`started_at` integer,
	`completed_at` integer,
	`triggered_by` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `lead_companies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`triggered_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE INDEX `siteAudit_companyId_idx` ON `site_audits` (`company_id`);
CREATE INDEX `siteAudit_triggeredBy_idx` ON `site_audits` (`triggered_by`);
CREATE INDEX `siteAudit_createdAt_idx` ON `site_audits` (`created_at`);
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`role` text NOT NULL,
	`banned` integer DEFAULT false,
	`ban_reason` text,
	`ban_expires` integer,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`locale` text DEFAULT 'en-US' NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);

CREATE UNIQUE INDEX `user_email_key` ON `users` (`email`);
CREATE TABLE `user_devices` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`fingerprint` text NOT NULL,
	`browser` text,
	`os` text,
	`device_type` text,
	`first_seen_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`last_seen_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `user_device_user_fingerprint_idx` ON `user_devices` (`user_id`,`fingerprint`);
CREATE INDEX `user_device_user_id_idx` ON `user_devices` (`user_id`);
CREATE TABLE `user_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`device_id` text,
	`session_id` text NOT NULL,
	`login_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`last_seen_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`logout_at` integer,
	`expires_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`device_id`) REFERENCES `user_devices`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE INDEX `user_session_user_id_idx` ON `user_sessions` (`user_id`);
CREATE UNIQUE INDEX `user_session_session_id_idx` ON `user_sessions` (`session_id`);
CREATE INDEX `user_session_login_at_idx` ON `user_sessions` (`login_at`);
CREATE INDEX `user_session_last_seen_at_idx` ON `user_sessions` (`last_seen_at`);
CREATE TABLE `user_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`email` text,
	`event` text NOT NULL,
	`session_id` text,
	`device_id` text,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`device_id`) REFERENCES `user_devices`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE INDEX `user_event_user_id_idx` ON `user_events` (`user_id`);
CREATE INDEX `user_event_event_idx` ON `user_events` (`event`);
CREATE INDEX `user_event_created_at_idx` ON `user_events` (`created_at`);
CREATE INDEX `user_event_session_id_idx` ON `user_events` (`session_id`);
CREATE TABLE `notification_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`category` text NOT NULL,
	`email_enabled` integer DEFAULT true NOT NULL,
	`push_enabled` integer DEFAULT true NOT NULL,
	`in_app_enabled` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `notification_settings_user_category_key` ON `notification_settings` (`user_id`,`category`);
CREATE TABLE `push_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`expiration_time` real,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `push_subscription_endpoint_unique` ON `push_subscriptions` (`endpoint`);
CREATE INDEX `push_subscription_user_id` ON `push_subscriptions` (`user_id`);
CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `account_accountProvider_accountId_idx` ON `accounts` (`provider_id`,`account_id`);
CREATE INDEX `account_userId_idx` ON `accounts` (`user_id`);
CREATE TABLE `addresses` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text DEFAULT 'other' NOT NULL,
	`street_line_1` text NOT NULL,
	`street_line_2` text,
	`city` text NOT NULL,
	`state` text,
	`zip_code` text NOT NULL,
	`country` text NOT NULL,
	`latitude` numeric,
	`longitude` numeric,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);

CREATE TABLE `ai_usages` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text DEFAULT 'openrouter' NOT NULL,
	`model` text NOT NULL,
	`activity` text NOT NULL,
	`prompt_tokens` integer DEFAULT 0 NOT NULL,
	`completion_tokens` integer DEFAULT 0 NOT NULL,
	`total_tokens` integer DEFAULT 0 NOT NULL,
	`cost` real,
	`latency_ms` integer DEFAULT 0 NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `ai_usages_createdBy_idx` ON `ai_usages` (`created_by`);
CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`filename` text NOT NULL,
	`original_name` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`url` text NOT NULL,
	`uploaded_by` text,
	`entity_type` text,
	`entity_id` text,
	`uploaded_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`deleted_at` integer,
	`deleted_by` text,
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE INDEX `file_user_idx` ON `files` (`uploaded_by`);
CREATE INDEX `file_deletedBy_idx` ON `files` (`deleted_by`);
CREATE INDEX `file_entityType_idx` ON `files` (`entity_type`,`entity_id`);
CREATE INDEX `file_key_idx` ON `files` (`key`);
CREATE INDEX `file_uploadedAt_idx` ON `files` (`uploaded_at`);
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`impersonated_by` text,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `session_token_idx` ON `sessions` (`token`);
CREATE INDEX `session_userId_idx` ON `sessions` (`user_id`);
CREATE INDEX `session_expiresAt_idx` ON `sessions` (`expires_at`);
CREATE TABLE `social_media` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`platform` text NOT NULL,
	`username` text NOT NULL,
	`url` text NOT NULL,
	`display_name` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);

CREATE INDEX `socialMedia_userName_idx` ON `social_media` (`username`);
CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);

CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'todo' NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`due_date` integer,
	`assigned_by` text,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `tasks_assigned_by_idx` ON `tasks` (`assigned_by`);
CREATE INDEX `tasks_status_idx` ON `tasks` (`status`);
CREATE INDEX `tasks_priority_idx` ON `tasks` (`priority`);
CREATE INDEX `tasks_due_date_idx` ON `tasks` (`due_date`);
CREATE INDEX `tasks_created_at_idx` ON `tasks` (`created_at`);
