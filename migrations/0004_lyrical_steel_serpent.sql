CREATE TABLE `company_task_assignees` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`user_id` text NOT NULL,
	`assigned_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `company_tasks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `company_task_assignees_task_id_user_id_key` ON `company_task_assignees` (`task_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `company_task_assignees_task_id_idx` ON `company_task_assignees` (`task_id`);--> statement-breakpoint
CREATE INDEX `company_task_assignees_user_id_idx` ON `company_task_assignees` (`user_id`);--> statement-breakpoint
CREATE TABLE `_company_task_assignee_backup` (`task_id` text NOT NULL, `user_id` text NOT NULL);--> statement-breakpoint
INSERT INTO `_company_task_assignee_backup` (`task_id`, `user_id`)
SELECT `id`, `assignee_id` FROM `company_tasks` WHERE `assignee_id` IS NOT NULL;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_company_tasks` (
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
	`assigned_by_id` text,
	`created_by` text,
	`updated_by` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`assigned_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_company_tasks`("id", "title", "description", "status", "priority", "due_date", "started_at", "completed_at", "source", "external_id", "metadata", "assigned_by_id", "created_by", "updated_by", "created_at", "updated_at") SELECT "id", "title", "description", "status", "priority", "due_date", "started_at", "completed_at", "source", "external_id", "metadata", "assigned_by_id", "created_by", "updated_by", "created_at", "updated_at" FROM `company_tasks`;--> statement-breakpoint
DROP TABLE `company_tasks`;--> statement-breakpoint
ALTER TABLE `__new_company_tasks` RENAME TO `company_tasks`;--> statement-breakpoint
INSERT INTO `company_task_assignees` (`id`, `task_id`, `user_id`)
SELECT
	lower(
		hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' ||
		substr(hex(randomblob(2)), 2) || '-' ||
		substr('89ab', abs(random()) % 4 + 1, 1) ||
		substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))
	),
	`task_id`, `user_id`
FROM `_company_task_assignee_backup`;--> statement-breakpoint
DROP TABLE `_company_task_assignee_backup`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `company_tasks_source_external_id_key` ON `company_tasks` (`source`,`external_id`);--> statement-breakpoint
CREATE INDEX `company_tasks_assigned_by_id_idx` ON `company_tasks` (`assigned_by_id`);--> statement-breakpoint
CREATE INDEX `company_tasks_created_by_idx` ON `company_tasks` (`created_by`);--> statement-breakpoint
CREATE INDEX `company_tasks_status_idx` ON `company_tasks` (`status`);--> statement-breakpoint
CREATE INDEX `company_tasks_priority_idx` ON `company_tasks` (`priority`);--> statement-breakpoint
CREATE INDEX `company_tasks_due_date_idx` ON `company_tasks` (`due_date`);--> statement-breakpoint
CREATE INDEX `company_tasks_created_at_idx` ON `company_tasks` (`created_at`);