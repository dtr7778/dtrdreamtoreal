import { relations } from "drizzle-orm";
import { foreignKey, index, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import { CompanyTable } from "./company.table";
import { EmployeeAddressTable } from "./employeeAddress.table";
import { EmployeeEmailThreadTable } from "./employeeEmailThread.table";
import { EmployeeSocialTable } from "./employeeSocial.table";

export const EmployeeTable = pgTable(
  "employees",
  {
    id: db_id,

    companyId: uuid("company_id").notNull(),

    firstName: varchar("first_name").notNull(),
    middleName: varchar("middle_name"),
    lastName: varchar("last_name"),

    email: varchar("email", { length: 256 }),
    phone: varchar("phone", { length: 50 }),

    jobTitle: varchar("job_title", { length: 256 }),
    department: varchar("department", { length: 100 }),
    website: varchar("website", { length: 500 }),

    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "employee_companyId_fkey",
      columns: [table.companyId],
      foreignColumns: [CompanyTable.id],
    }).onDelete("cascade"),
    index("employee_companyId_idx").on(table.companyId),
  ]
);

export const EmployeeRelations = relations(EmployeeTable, ({ many, one }) => ({
  company: one(CompanyTable, {
    fields: [EmployeeTable.companyId],
    references: [CompanyTable.id],
    relationName: "EmployeeToCompany",
  }),
  addresses: many(EmployeeAddressTable, {
    relationName: "EmployeeAddressToEmployee",
  }),
  socialMedia: many(EmployeeSocialTable, { relationName: "EmployeeSocialToEmployee" }),
  emailThreads: many(EmployeeEmailThreadTable, {
    relationName: "EmployeeEmailThreadToEmployee",
  }),
}));

export const insertEmployeeSchema = createInsertSchema(EmployeeTable, {
  website: z.url().optional(),
  email: z.email().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectEmployeeSchema = createSelectSchema(EmployeeTable, {
  website: z.url().optional(),
  email: z.email().optional(),
});
export const updateEmployeeSchema = createUpdateSchema(EmployeeTable, {
  website: z.url().optional(),
  email: z.email().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type EmployeeDataModel = typeof EmployeeTable.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type SelectEmployee = z.infer<typeof selectEmployeeSchema>;
export type UpdateEmployee = z.infer<typeof updateEmployeeSchema>;
