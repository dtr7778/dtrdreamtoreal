import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import {
  db_created_at,
  db_date,
  db_id,
  db_updated_at,
} from "../../../utils/db-utils";
import {
  TaskPriorityEnum,
  TaskSourceEnum,
  TaskStatusEnum,
} from "../../enums/db-enums";
import { UserTable } from "../user";
import { CompanyTaskAssigneeTable } from "./companyTaskAssignee.table";

export type TaskMetadata = Record<string, unknown>;

export const CompanyTaskTable = sqliteTable(
  "company_tasks",
  {
    id: db_id,
    title: text("title").notNull(),
    description: text("description"),
    status: TaskStatusEnum("status").default("todo").notNull(),
    priority: TaskPriorityEnum("priority").default("medium").notNull(),
    dueDate: db_date("due_date"),
    startedAt: db_date("started_at"),
    completedAt: db_date("completed_at"),

    source: TaskSourceEnum("source").default("manual").notNull(),
    externalId: text("external_id"),
    metadata: text("metadata", { mode: "json" }).$type<TaskMetadata>(),

    assignedById: text("assigned_by_id"),
    createdBy: text("created_by"),
    updatedBy: text("updated_by"),

    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "company_tasks_assigned_by_id_fkey",
      columns: [table.assignedById],
      foreignColumns: [UserTable.id],
    }).onDelete("set null"),
    foreignKey({
      name: "company_tasks_created_by_fkey",
      columns: [table.createdBy],
      foreignColumns: [UserTable.id],
    }).onDelete("set null"),
    foreignKey({
      name: "company_tasks_updated_by_fkey",
      columns: [table.updatedBy],
      foreignColumns: [UserTable.id],
    }).onDelete("set null"),
    uniqueIndex("company_tasks_source_external_id_key").on(
      table.source,
      table.externalId
    ),
    index("company_tasks_assigned_by_id_idx").on(table.assignedById),
    index("company_tasks_created_by_idx").on(table.createdBy),
    index("company_tasks_status_idx").on(table.status),
    index("company_tasks_priority_idx").on(table.priority),
    index("company_tasks_due_date_idx").on(table.dueDate),
    index("company_tasks_created_at_idx").on(table.createdAt),
  ]
);

export const CompanyTaskRelations = relations(
  CompanyTaskTable,
  ({ one, many }) => ({
    assignees: many(CompanyTaskAssigneeTable, {
      relationName: "CompanyTaskToAssignee",
    }),
    assignedBy: one(UserTable, {
      fields: [CompanyTaskTable.assignedById],
      references: [UserTable.id],
      relationName: "CompanyTaskToAssignedBy",
    }),
    createdBy: one(UserTable, {
      fields: [CompanyTaskTable.createdBy],
      references: [UserTable.id],
      relationName: "CompanyTaskToCreatedBy",
    }),
    updatedBy: one(UserTable, {
      fields: [CompanyTaskTable.updatedBy],
      references: [UserTable.id],
      relationName: "CompanyTaskToUpdatedBy",
    }),
  })
);

export const insertCompanyTaskSchema = createInsertSchema(CompanyTaskTable, {
  assignedById: z.uuid().nullish(),
  createdBy: z.uuid().nullish(),
  updatedBy: z.uuid().nullish(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectCompanyTaskSchema = createSelectSchema(CompanyTaskTable, {
  id: z.uuid(),
  assignedById: z.uuid().nullish(),
  createdBy: z.uuid().nullish(),
  updatedBy: z.uuid().nullish(),
});
export const updateCompanyTaskSchema = createUpdateSchema(CompanyTaskTable, {
  assignedById: z.uuid().nullish(),
  updatedBy: z.uuid().nullish(),
}).omit({
  id: true,
  source: true,
  externalId: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});

export type CompanyTaskDataModel = typeof CompanyTaskTable.$inferSelect;
export type InsertCompanyTask = z.infer<typeof insertCompanyTaskSchema>;
export type SelectCompanyTask = z.infer<typeof selectCompanyTaskSchema>;
export type UpdateCompanyTask = z.infer<typeof updateCompanyTaskSchema>;
