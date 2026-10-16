import { relations, sql } from "drizzle-orm";
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
import z from "zod";

import { db_id } from "../../db-utils";
import { UserTable } from "../user";
import { CompanyTaskTable } from "./companyTask.table";

export const CompanyTaskAssigneeTable = sqliteTable(
  "company_task_assignees",
  {
    id: db_id,
    taskId: text("task_id").notNull(),
    userId: text("user_id").notNull(),
    assignedAt: integer("assigned_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    foreignKey({
      name: "company_task_assignees_task_id_fkey",
      columns: [table.taskId],
      foreignColumns: [CompanyTaskTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "company_task_assignees_user_id_fkey",
      columns: [table.userId],
      foreignColumns: [UserTable.id],
    }).onDelete("cascade"),
    uniqueIndex("company_task_assignees_task_id_user_id_key").on(
      table.taskId,
      table.userId
    ),
    index("company_task_assignees_task_id_idx").on(table.taskId),
    index("company_task_assignees_user_id_idx").on(table.userId),
  ]
);

export const CompanyTaskAssigneeRelations = relations(
  CompanyTaskAssigneeTable,
  ({ one }) => ({
    task: one(CompanyTaskTable, {
      fields: [CompanyTaskAssigneeTable.taskId],
      references: [CompanyTaskTable.id],
      relationName: "CompanyTaskToAssignee",
    }),
    user: one(UserTable, {
      fields: [CompanyTaskAssigneeTable.userId],
      references: [UserTable.id],
      relationName: "CompanyTaskAssigneeToUser",
    }),
  })
);

export const insertCompanyTaskAssigneeSchema = createInsertSchema(
  CompanyTaskAssigneeTable,
  {
    taskId: z.uuid(),
    userId: z.uuid(),
  }
).omit({
  id: true,
  assignedAt: true,
});
export const selectCompanyTaskAssigneeSchema = createSelectSchema(
  CompanyTaskAssigneeTable,
  {
    id: z.uuid(),
    taskId: z.uuid(),
    userId: z.uuid(),
  }
);
export const updateCompanyTaskAssigneeSchema = createUpdateSchema(
  CompanyTaskAssigneeTable,
  {
    taskId: z.uuid().optional(),
    userId: z.uuid().optional(),
  }
).omit({
  id: true,
  assignedAt: true,
});

export type CompanyTaskAssigneeDataModel =
  typeof CompanyTaskAssigneeTable.$inferSelect;
export type InsertCompanyTaskAssignee = z.infer<
  typeof insertCompanyTaskAssigneeSchema
>;
export type SelectCompanyTaskAssignee = z.infer<
  typeof selectCompanyTaskAssigneeSchema
>;
export type UpdateCompanyTaskAssignee = z.infer<
  typeof updateCompanyTaskAssigneeSchema
>;
