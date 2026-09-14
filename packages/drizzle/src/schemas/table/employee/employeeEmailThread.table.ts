import { relations } from "drizzle-orm";
import { foreignKey, index, pgTable, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id } from "../../../db-utils";
import { EmailThreadTable } from "../email/emailThread.table";
import { EmployeeTable } from "./employee.table";

export const EmployeeEmailThreadTable = pgTable(
  "employee_email_threads",
  {
    id: db_id,
    employeeId: uuid("employee_id").notNull(),
    emailThreadId: uuid("email_thread_id").notNull(),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "employeeEmailThread_employeeId_fkey",
      columns: [table.employeeId],
      foreignColumns: [EmployeeTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "employeeEmailThread_emailThreadId_fkey",
      columns: [table.emailThreadId],
      foreignColumns: [EmailThreadTable.id],
    }).onDelete("cascade"),
    index("employeeEmailThread_employeeId_idx").on(table.employeeId),
    index("employeeEmailThread_emailThreadId_idx").on(table.emailThreadId),
  ]
);

export const EmployeeEmailThreadRelation = relations(
  EmployeeEmailThreadTable,
  ({ one }) => ({
    employee: one(EmployeeTable, {
      fields: [EmployeeEmailThreadTable.employeeId],
      references: [EmployeeTable.id],
      relationName: "EmployeeEmailThreadToEmployee",
    }),
    emailThread: one(EmailThreadTable, {
      fields: [EmployeeEmailThreadTable.emailThreadId],
      references: [EmailThreadTable.id],
      relationName: "EmployeeEmailThreadToEmailThread",
    }),
  })
);

export const insertEmployeeEmailThreadSchema = createInsertSchema(
  EmployeeEmailThreadTable
).omit({
  id: true,
  createdAt: true,
});
export const selectEmployeeEmailThreadSchema = createSelectSchema(
  EmployeeEmailThreadTable
);

export type EmployeeEmailThreadDataModel =
  typeof EmployeeEmailThreadTable.$inferSelect;
export type InsertEmployeeEmailThread = z.infer<
  typeof insertEmployeeEmailThreadSchema
>;
export type SelectEmployeeEmailThread = z.infer<
  typeof selectEmployeeEmailThreadSchema
>;
