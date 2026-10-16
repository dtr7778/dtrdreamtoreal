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
import { UserTable } from "../user";
import { LeadCompanyTable } from "./leadCompany.table";
import { LeadUserAddressTable } from "./leadUserAddress.table";
import { LeadUserEmailThreadTable } from "./leadUserEmailThread.table";
import { LeadUserSocialTable } from "./leadUserSocial.table";

export const LeadUserTable = sqliteTable(
  "lead_users",
  {
    id: db_id,

    leadCompanyId: text("lead_company_id"),

    firstName: text("first_name").notNull(),
    middleName: text("middle_name"),
    lastName: text("last_name"),

    email: text("email"),
    phone: text("phone"),

    jobTitle: text("job_title"),
    department: text("department"),
    website: text("website"),

    source: text("source").notNull(),
    externalId: text("external_id"),

    createdBy: text("created_by"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "leadUser_leadCompanyId_fkey",
      columns: [table.leadCompanyId],
      foreignColumns: [LeadCompanyTable.id],
    }).onDelete("set null"),
    foreignKey({
      name: "leadUser_createdBy_fkey",
      columns: [table.createdBy],
      foreignColumns: [UserTable.id],
    }).onDelete("set null"),
    index("leadUser_leadCompanyId_idx").on(table.leadCompanyId),
    index("leadUser_createdBy_idx").on(table.createdBy),
    uniqueIndex("leadUser_source_externalId_idx").on(
      table.source,
      table.externalId
    ),
  ]
);

export const LeadUserRelations = relations(LeadUserTable, ({ many, one }) => ({
  createdBy: one(UserTable, {
    fields: [LeadUserTable.createdBy],
    references: [UserTable.id],
    relationName: "LeadUserToUser",
  }),
  leadCompany: one(LeadCompanyTable, {
    fields: [LeadUserTable.leadCompanyId],
    references: [LeadCompanyTable.id],
    relationName: "LeadUserToLeadCompany",
  }),
  addresses: many(LeadUserAddressTable, {
    relationName: "LeadUserAddressToLeadUser",
  }),
  socialMedia: many(LeadUserSocialTable, {
    relationName: "LeadUserSocialToLeadUser",
  }),
  emailThreads: many(LeadUserEmailThreadTable, {
    relationName: "LeadUserEmailThreadToLeadUser",
  }),
}));

export const insertLeadUserSchema = createInsertSchema(LeadUserTable, {
  website: z.url().optional(),
  email: z.email().optional(),
  leadCompanyId: z.uuid().nullish(),
  createdBy: z.uuid().nullish(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectLeadUserSchema = createSelectSchema(LeadUserTable, {
  website: z.url().nullable(),
  email: z.email().nullable(),
  id: z.uuid(),
  leadCompanyId: z.uuid().nullish(),
  createdBy: z.uuid().nullish(),
});
export const updateLeadUserSchema = createUpdateSchema(LeadUserTable, {
  website: z.url().optional(),
  email: z.email().optional(),
  leadCompanyId: z.uuid().nullish(),
}).omit({
  id: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});

export type LeadUserDataModel = typeof LeadUserTable.$inferSelect;
export type InsertLeadUser = z.infer<typeof insertLeadUserSchema>;
export type SelectLeadUser = z.infer<typeof selectLeadUserSchema>;
export type UpdateLeadUser = z.infer<typeof updateLeadUserSchema>;
