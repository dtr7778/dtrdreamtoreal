import { relations } from "drizzle-orm";
import { foreignKey, index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_bool, db_created_at, db_id } from "../../../utils/db-utils";
import { AddressTable } from "../address.table";
import { LeadCompanyTable } from "./leadCompany.table";

export const LeadCompanyAddressTable = sqliteTable(
  "lead_company_addresses",
  {
    id: db_id,
    leadCompanyId: text("lead_company_id").notNull(),
    addressId: text("address_id").notNull(),
    isPrimary: db_bool("is_primary").notNull().default(true),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "leadCompanyAddress_leadCompanyId_fkey",
      columns: [table.leadCompanyId],
      foreignColumns: [LeadCompanyTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "leadCompanyAddress_addressId_fkey",
      columns: [table.addressId],
      foreignColumns: [AddressTable.id],
    }).onDelete("cascade"),
    index("leadCompanyAddress_leadCompanyId_idx").on(table.leadCompanyId),
    index("leadCompanyAddress_addressId_idx").on(table.addressId),
  ]
);

export const LeadCompanyAddressRelation = relations(
  LeadCompanyAddressTable,
  ({ one }) => ({
    leadCompany: one(LeadCompanyTable, {
      fields: [LeadCompanyAddressTable.leadCompanyId],
      references: [LeadCompanyTable.id],
      relationName: "LeadCompanyAddressToLeadCompany",
    }),
    address: one(AddressTable, {
      fields: [LeadCompanyAddressTable.addressId],
      references: [AddressTable.id],
      relationName: "LeadCompanyAddressToAddress",
    }),
  })
);

export const insertLeadCompanyAddressSchema = createInsertSchema(
  LeadCompanyAddressTable,
  {
    leadCompanyId: z.uuid(),
    addressId: z.uuid(),
  }
).omit({
  id: true,
  createdAt: true,
});
export const selectLeadCompanyAddressSchema = createSelectSchema(
  LeadCompanyAddressTable,
  {
    id: z.uuid(),
    leadCompanyId: z.uuid(),
    addressId: z.uuid(),
  }
);
export const updateLeadCompanyAddressSchema = createUpdateSchema(
  LeadCompanyAddressTable,
  {
    leadCompanyId: z.uuid().optional(),
    addressId: z.uuid().optional(),
  }
).omit({
  id: true,
  createdAt: true,
});

export type LeadCompanyAddressDataModel =
  typeof LeadCompanyAddressTable.$inferSelect;
export type InsertLeadCompanyAddress = z.infer<
  typeof insertLeadCompanyAddressSchema
>;
export type SelectLeadCompanyAddress = z.infer<
  typeof selectLeadCompanyAddressSchema
>;
export type UpdateLeadCompanyAddress = z.infer<
  typeof updateLeadCompanyAddressSchema
>;
