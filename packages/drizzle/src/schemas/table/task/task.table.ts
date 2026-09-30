import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import { TaskPriorityEnum, TaskStatusEnum } from "../../enums/db-enums";
import { UserTable } from "../user";

export const TaskTable = pgTable(
  "tasks",
  {
    id: db_id,
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    status: TaskStatusEnum("status").default("todo").notNull(),
    priority: TaskPriorityEnum("priority").default("medium").notNull(),
    dueDate: timestamp("due_date", { withTimezone: true, precision: 3 }),

    assignedBy: uuid("assigned_by"),
    createdBy: uuid("created_by").notNull(),

    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "tasks_assigned_by_fkey",
      columns: [table.assignedBy],
      foreignColumns: [UserTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "tasks_created_by_fkey",
      columns: [table.createdBy],
      foreignColumns: [UserTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("tasks_assigned_by_idx").on(table.assignedBy),
    index("tasks_status_idx").on(table.status),
    index("tasks_priority_idx").on(table.priority),
    index("tasks_due_date_idx").on(table.dueDate),
    index("tasks_created_at_idx").on(table.createdAt),
  ]
);

export const TaskRelations = relations(TaskTable, ({ one }) => ({
  assignedBy: one(UserTable, {
    fields: [TaskTable.assignedBy],
    references: [UserTable.id],
    relationName: "TaskToAssignedBy",
  }),
  createdBy: one(UserTable, {
    fields: [TaskTable.createdBy],
    references: [UserTable.id],
    relationName: "TaskToCreatedBy",
  }),
}));

export const insertTaskSchema = createInsertSchema(TaskTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectTaskSchema = createSelectSchema(TaskTable);
export const updateTaskSchema = createUpdateSchema(TaskTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TaskDataModel = typeof TaskTable.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type SelectTask = z.infer<typeof selectTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
