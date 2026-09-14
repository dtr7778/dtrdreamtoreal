import { relations } from "drizzle-orm";
import { index, pgTable, text, varchar } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import { CompanyAddressTable } from "./companyAddress.table";
import { CompanyEmailThreadTable } from "./companyEmailThread.table";
import { CompanySocialTable } from "./companySocial.table";
import { EmployeeTable } from "./employee.table";

export const CompanyTable = pgTable(
  "companies",
  {
    id: db_id,
    name: varchar("name", { length: 255 }).notNull(),
    legalName: varchar("legal_name", { length: 255 }),
    website: varchar("website", { length: 500 }),
    industry: varchar("industry", { length: 100 }),
    employSize: varchar("employ_size", { length: 50 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    description: text("description"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [index("companies_name_idx").on(table.name)]
);

export const CompanyRelation = relations(CompanyTable, ({ many }) => ({
  employees: many(EmployeeTable, {
    relationName: "EmployeeToCompany",
  }),
  addresses: many(CompanyAddressTable, {
    relationName: "CompanyAddressToCompany",
  }),
  socialMedia: many(CompanySocialTable, {
    relationName: "CompanySocialToCompany",
  }),
  emailThreads: many(CompanyEmailThreadTable, {
    relationName: "CompanyEmailThreadToCompany",
  }),
}));

export const insertCompanySchema = createInsertSchema(CompanyTable, {
  website: z.url().optional(),
  email: z.email().optional(),
}).omit({
  id: true,
  updatedAt: true,
  createdAt: true,
});
export const selectCompanySchema = createSelectSchema(CompanyTable, {
  website: z.url().optional(),
  email: z.email().optional(),
});
export const updateCompanySchema = createUpdateSchema(CompanyTable, {
  website: z.url().optional(),
  email: z.email().optional(),
}).omit({
  id: true,
  updatedAt: true,
  createdAt: true,
});

export type CompanyDataModel = typeof CompanyTable.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type SelectCompany = z.infer<typeof selectCompanySchema>;
export type UpdateCompany = z.infer<typeof updateCompanySchema>;
