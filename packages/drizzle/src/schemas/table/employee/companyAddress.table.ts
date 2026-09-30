import { relations } from "drizzle-orm";
import { boolean, foreignKey, index, pgTable, uuid } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id } from "../../../db-utils";
import { AddressTable } from "../address.table";
import { CompanyTable } from "./company.table";

export const CompanyAddressTable = pgTable(
  "company_addresses",
  {
    id: db_id,
    companyId: uuid("company_id").notNull(),
    addressId: uuid("address_id").notNull(),
    isPrimary: boolean("is_primary").notNull().default(true),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "companyAddress_companyId_fkey",
      columns: [table.companyId],
      foreignColumns: [CompanyTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "companyAddress_addressId_fkey",
      columns: [table.addressId],
      foreignColumns: [AddressTable.id],
    }).onDelete("cascade"),
    index("companyAddress_companyId_idx").on(table.companyId),
    index("companyAddress_addressId_idx").on(table.addressId),
  ]
);

export const CompanyAddressRelation = relations(
  CompanyAddressTable,
  ({ one }) => ({
    company: one(CompanyTable, {
      fields: [CompanyAddressTable.companyId],
      references: [CompanyTable.id],
      relationName: "CompanyAddressToCompany",
    }),
    address: one(AddressTable, {
      fields: [CompanyAddressTable.addressId],
      references: [AddressTable.id],
      relationName: "CompanyAddressToAddress",
    }),
  })
);

export const insertCompanyAddressSchema = createInsertSchema(
  CompanyAddressTable
).omit({
  id: true,
  createdAt: true,
});
export const selectCompanyAddressSchema =
  createSelectSchema(CompanyAddressTable);
export const updateCompanyAddressSchema = createUpdateSchema(
  CompanyAddressTable
).omit({
  id: true,
  createdAt: true,
});

export type CompanyAddressDataModel = typeof CompanyAddressTable.$inferSelect;
export type InsertCompanyAddress = z.infer<typeof insertCompanyAddressSchema>;
export type SelectCompanyAddress = z.infer<typeof selectCompanyAddressSchema>;
export type UpdateCompanyAddress = z.infer<typeof updateCompanyAddressSchema>;
