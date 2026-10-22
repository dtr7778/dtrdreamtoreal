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
import { LeadUserTable } from "./leadUser.table";

export const LeadUserAddressTable = sqliteTable(
  "lead_user_addresses",
  {
    id: db_id,
    leadUserId: text("lead_user_id").notNull(),
    addressId: text("address_id").notNull(),
    isPrimary: db_bool("is_primary").notNull().default(true),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "leadUserAddress_leadUserId_fkey",
      columns: [table.leadUserId],
      foreignColumns: [LeadUserTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "leadUserAddress_addressId_fkey",
      columns: [table.addressId],
      foreignColumns: [AddressTable.id],
    }).onDelete("cascade"),
    index("leadUserAddress_leadUserId_idx").on(table.leadUserId),
    index("leadUserAddress_addressId_idx").on(table.addressId),
  ]
);

export const LeadUserAddressRelation = relations(
  LeadUserAddressTable,
  ({ one }) => ({
    leadUser: one(LeadUserTable, {
      fields: [LeadUserAddressTable.leadUserId],
      references: [LeadUserTable.id],
      relationName: "LeadUserAddressToLeadUser",
    }),
    address: one(AddressTable, {
      fields: [LeadUserAddressTable.addressId],
      references: [AddressTable.id],
      relationName: "LeadUserAddressToAddress",
    }),
  })
);

export const insertLeadUserAddressSchema = createInsertSchema(
  LeadUserAddressTable,
  {
    leadUserId: z.uuid(),
    addressId: z.uuid(),
  }
).omit({
  id: true,
  createdAt: true,
});
export const selectLeadUserAddressSchema = createSelectSchema(
  LeadUserAddressTable,
  {
    id: z.uuid(),
    leadUserId: z.uuid(),
    addressId: z.uuid(),
  }
);
export const updateLeadUserAddressSchema = createUpdateSchema(
  LeadUserAddressTable,
  {
    leadUserId: z.uuid().optional(),
    addressId: z.uuid().optional(),
  }
).omit({
  id: true,
  createdAt: true,
});

export type LeadUserAddressDataModel = typeof LeadUserAddressTable.$inferSelect;
export type InsertLeadUserAddress = z.infer<typeof insertLeadUserAddressSchema>;
export type SelectLeadUserAddress = z.infer<typeof selectLeadUserAddressSchema>;
export type UpdateLeadUserAddress = z.infer<typeof updateLeadUserAddressSchema>;
