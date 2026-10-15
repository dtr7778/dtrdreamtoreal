CREATE TABLE `company_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'todo' NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`due_date` integer,
	`started_at` integer,
	`completed_at` integer,
	`source` text DEFAULT 'manual' NOT NULL,
	`external_id` text,
	`metadata` text,
	`assignee_id` text,
	`assigned_by_id` text,
	`created_by` text,
	`updated_by` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`assignee_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`assigned_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `company_tasks_source_external_id_key` ON `company_tasks` (`source`,`external_id`);--> statement-breakpoint
CREATE INDEX `company_tasks_assignee_id_status_idx` ON `company_tasks` (`assignee_id`,`status`);--> statement-breakpoint
CREATE INDEX `company_tasks_assigned_by_id_idx` ON `company_tasks` (`assigned_by_id`);--> statement-breakpoint
CREATE INDEX `company_tasks_created_by_idx` ON `company_tasks` (`created_by`);--> statement-breakpoint
CREATE INDEX `company_tasks_status_idx` ON `company_tasks` (`status`);--> statement-breakpoint
CREATE INDEX `company_tasks_priority_idx` ON `company_tasks` (`priority`);--> statement-breakpoint
CREATE INDEX `company_tasks_due_date_idx` ON `company_tasks` (`due_date`);--> statement-breakpoint
CREATE INDEX `company_tasks_created_at_idx` ON `company_tasks` (`created_at`);--> statement-breakpoint
CREATE TABLE `personal_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'todo' NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`due_date` integer,
	`started_at` integer,
	`completed_at` integer,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`source` text DEFAULT 'manual' NOT NULL,
	`external_id` text,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `personal_tasks_user_id_source_external_id_key` ON `personal_tasks` (`user_id`,`source`,`external_id`);--> statement-breakpoint
CREATE INDEX `personal_tasks_user_id_status_idx` ON `personal_tasks` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `personal_tasks_user_id_due_date_idx` ON `personal_tasks` (`user_id`,`due_date`);--> statement-breakpoint
CREATE INDEX `personal_tasks_user_id_sort_order_idx` ON `personal_tasks` (`user_id`,`sort_order`);--> statement-breakpoint
DROP TABLE `tasks`;