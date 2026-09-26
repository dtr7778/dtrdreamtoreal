import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  jsonb,
  pgTable,
  text,
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
import { SiteAuditTable } from "../siteAudit/siteAudit.table";
import { UserTable } from "../user";
import { CompanyAddressTable } from "./companyAddress.table";
import { CompanyAiUsageTable } from "./companyAiUsage.table";
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
    context: jsonb("context")
      .$type<Record<string, string | string[]>>()
      .notNull()
      .default({}),

    createdBy: uuid("created_by").notNull(),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "company_createdBy_fkey",
      columns: [table.createdBy],
      foreignColumns: [UserTable.id],
    }).onDelete("set null"),
    index("companies_createdBy_idx").on(table.createdBy),
    index("companies_name_idx").on(table.name),
  ]
);

export const CompanyRelation = relations(CompanyTable, ({ many, one }) => ({
  createdBy: one(UserTable, {
    fields: [CompanyTable.createdBy],
    references: [UserTable.id],
    relationName: "CompanyToUser",
  }),
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
  siteAudits: many(SiteAuditTable, { relationName: "SiteAuditToCompany" }),
  aiUsages: many(CompanyAiUsageTable, {
    relationName: "CompanyAiUsageToCompany",
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
  website: z.url().nullable(),
  email: z.email().nullable(),
});
export const updateCompanySchema = createUpdateSchema(CompanyTable, {
  website: z.url().optional(),
  email: z.email().optional(),
}).omit({
  id: true,
  createdBy: true,
  updatedAt: true,
  createdAt: true,
});

export type CompanyDataModel = typeof CompanyTable.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type SelectCompany = z.infer<typeof selectCompanySchema>;
export type UpdateCompany = z.infer<typeof updateCompanySchema>;
