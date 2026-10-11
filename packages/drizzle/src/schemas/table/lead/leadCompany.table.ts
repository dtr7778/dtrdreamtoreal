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

import { db_created_at, db_id, db_updated_at } from "../../db-utils";
import { SiteAuditTable } from "../siteAudit/siteAudit.table";
import { UserTable } from "../user";
import { LeadCompanyAddressTable } from "./leadCompanyAddress.table";
import { LeadCompanyAiUsageTable } from "./leadCompanyAiUsage.table";
import { LeadCompanyEmailThreadTable } from "./leadCompanyEmailThread.table";
import { LeadCompanySocialTable } from "./leadCompanySocial.table";
import { LeadUserTable } from "./leadUser.table";

export const LeadCompanyTable = sqliteTable(
  "lead_companies",
  {
    id: db_id,
    name: text("name").notNull(),
    legalName: text("legal_name"),
    website: text("website"),
    industry: text("industry"),
    employSize: text("employ_size"),
    email: text("email"),
    phone: text("phone"),
    description: text("description"),
    context: text("context", { mode: "json" })
      .$type<Record<string, string | string[]>>()
      .notNull()
      .default({}),

    source: text("source").notNull(),
    externalId: text("external_id"),

    createdBy: text("created_by"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "leadCompany_createdBy_fkey",
      columns: [table.createdBy],
      foreignColumns: [UserTable.id],
    }).onDelete("set null"),
    index("leadCompany_createdBy_idx").on(table.createdBy),
    index("leadCompany_name_idx").on(table.name),
    uniqueIndex("leadCompany_source_externalId_idx").on(
      table.source,
      table.externalId
    ),
  ]
);

export const LeadCompanyRelation = relations(
  LeadCompanyTable,
  ({ many, one }) => ({
    createdBy: one(UserTable, {
      fields: [LeadCompanyTable.createdBy],
      references: [UserTable.id],
      relationName: "LeadCompanyToUser",
    }),
    leadUsers: many(LeadUserTable, {
      relationName: "LeadUserToLeadCompany",
    }),
    addresses: many(LeadCompanyAddressTable, {
      relationName: "LeadCompanyAddressToLeadCompany",
    }),
    socialMedia: many(LeadCompanySocialTable, {
      relationName: "LeadCompanySocialToLeadCompany",
    }),
    emailThreads: many(LeadCompanyEmailThreadTable, {
      relationName: "LeadCompanyEmailThreadToLeadCompany",
    }),
    siteAudits: many(SiteAuditTable, {
      relationName: "SiteAuditToLeadCompany",
    }),
    aiUsages: many(LeadCompanyAiUsageTable, {
      relationName: "LeadCompanyAiUsageToLeadCompany",
    }),
  })
);

export const insertLeadCompanySchema = createInsertSchema(LeadCompanyTable, {
  website: z.url().optional(),
  email: z.email().optional(),
}).omit({
  id: true,
  updatedAt: true,
  createdAt: true,
});
export const selectLeadCompanySchema = createSelectSchema(LeadCompanyTable, {
  website: z.url().nullable(),
  email: z.email().nullable(),
});
export const updateLeadCompanySchema = createUpdateSchema(LeadCompanyTable, {
  website: z.url().optional(),
  email: z.email().optional(),
}).omit({
  id: true,
  createdBy: true,
  updatedAt: true,
  createdAt: true,
});

export type LeadCompanyDataModel = typeof LeadCompanyTable.$inferSelect;
export type InsertLeadCompany = z.infer<typeof insertLeadCompanySchema>;
export type SelectLeadCompany = z.infer<typeof selectLeadCompanySchema>;
export type UpdateLeadCompany = z.infer<typeof updateLeadCompanySchema>;
