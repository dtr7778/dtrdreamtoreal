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
--> statement-breakpoint
CREATE INDEX `chatRoom_type_idx` ON `chat_rooms` (`type`);--> statement-breakpoint
CREATE INDEX `chatRoom_createdBy_idx` ON `chat_rooms` (`created_by`);--> statement-breakpoint
CREATE INDEX `chatRoom_lastMessageAt_idx` ON `chat_rooms` (`last_message_at`);--> statement-breakpoint
CREATE INDEX `chatRoom_isArchived_idx` ON `chat_rooms` (`is_archived`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE UNIQUE INDEX `chatRoomMember_roomId_userId_key` ON `chat_room_members` (`room_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `chatRoomMember_roomId_idx` ON `chat_room_members` (`room_id`);--> statement-breakpoint
CREATE INDEX `chatRoomMember_userId_idx` ON `chat_room_members` (`user_id`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE INDEX `chatMessage_roomId_idx` ON `chat_messages` (`room_id`);--> statement-breakpoint
CREATE INDEX `chatMessage_senderId_idx` ON `chat_messages` (`sender_id`);--> statement-breakpoint
CREATE INDEX `chatMessage_parentMessageId_idx` ON `chat_messages` (`parent_message_id`);--> statement-breakpoint
CREATE INDEX `chatMessage_replyToMessageId_idx` ON `chat_messages` (`reply_to_message_id`);--> statement-breakpoint
CREATE INDEX `chatMessage_roomId_createdAt_idx` ON `chat_messages` (`room_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `chatMessage_createdAt_idx` ON `chat_messages` (`created_at`);--> statement-breakpoint
CREATE TABLE `chat_message_reactions` (
	`id` text PRIMARY KEY NOT NULL,
	`message_id` text NOT NULL,
	`user_id` text NOT NULL,
	`emoji` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`message_id`) REFERENCES `chat_messages`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `chatMessageReaction_messageId_userId_emoji_key` ON `chat_message_reactions` (`message_id`,`user_id`,`emoji`);--> statement-breakpoint
CREATE INDEX `chatMessageReaction_messageId_idx` ON `chat_message_reactions` (`message_id`);--> statement-breakpoint
CREATE INDEX `chatMessageReaction_userId_idx` ON `chat_message_reactions` (`user_id`);--> statement-breakpoint
CREATE TABLE `chat_message_attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`message_id` text NOT NULL,
	`file_id` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`message_id`) REFERENCES `chat_messages`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `chatMessageAttachment_messageId_fileId_key` ON `chat_message_attachments` (`message_id`,`file_id`);--> statement-breakpoint
CREATE INDEX `chatMessageAttachment_messageId_idx` ON `chat_message_attachments` (`message_id`);--> statement-breakpoint
CREATE INDEX `chatMessageAttachment_fileId_idx` ON `chat_message_attachments` (`file_id`);