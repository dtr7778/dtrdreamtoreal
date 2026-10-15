import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../db-utils";
import {
  TaskPriorityEnum,
  TaskSourceEnum,
  TaskStatusEnum,
} from "../../enums/db-enums";
import { UserTable } from "../user";
import type { TaskMetadata } from "./companyTask.table";

export const PersonalTaskTable = sqliteTable(
  "personal_tasks",
  {
    id: db_id,
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    status: TaskStatusEnum("status").default("todo").notNull(),
    priority: TaskPriorityEnum("priority").default("medium").notNull(),
    dueDate: integer("due_date", { mode: "timestamp_ms" }),
    startedAt: integer("started_at", { mode: "timestamp_ms" }),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    sortOrder: integer("sort_order").default(0).notNull(),

    source: TaskSourceEnum("source").default("manual").notNull(),
    externalId: text("external_id"),
    metadata: text("metadata", { mode: "json" }).$type<TaskMetadata>(),

    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "personal_tasks_user_id_fkey",
      columns: [table.userId],
      foreignColumns: [UserTable.id],
    }).onDelete("cascade"),
    uniqueIndex("personal_tasks_user_id_source_external_id_key").on(
      table.userId,
      table.source,
      table.externalId
    ),
    index("personal_tasks_user_id_status_idx").on(table.userId, table.status),
    index("personal_tasks_user_id_due_date_idx").on(
      table.userId,
      table.dueDate
    ),
    index("personal_tasks_user_id_sort_order_idx").on(
      table.userId,
      table.sortOrder
    ),
  ]
);

export const PersonalTaskRelations = relations(
  PersonalTaskTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [PersonalTaskTable.userId],
      references: [UserTable.id],
      relationName: "PersonalTaskToUser",
    }),
  })
);

export const insertPersonalTaskSchema = createInsertSchema(
  PersonalTaskTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectPersonalTaskSchema = createSelectSchema(PersonalTaskTable);
export const updatePersonalTaskSchema = createUpdateSchema(
  PersonalTaskTable
).omit({
  id: true,
  userId: true,
  source: true,
  externalId: true,
  createdAt: true,
  updatedAt: true,
});

export type PersonalTaskDataModel = typeof PersonalTaskTable.$inferSelect;
export type InsertPersonalTask = z.infer<typeof insertPersonalTaskSchema>;
export type SelectPersonalTask = z.infer<typeof selectPersonalTaskSchema>;
export type UpdatePersonalTask = z.infer<typeof updatePersonalTaskSchema>;
