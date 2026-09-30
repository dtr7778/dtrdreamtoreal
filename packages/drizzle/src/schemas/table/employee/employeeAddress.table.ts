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
import { EmployeeTable } from "./employee.table";

export const EmployeeAddressTable = pgTable(
  "employee_addresses",
  {
    id: db_id,
    employeeId: uuid("employee_id").notNull(),
    addressId: uuid("address_id").notNull(),
    isPrimary: boolean("is_primary").notNull().default(true),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "employeeAddress_employeeId_fkey",
      columns: [table.employeeId],
      foreignColumns: [EmployeeTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "employeeAddress_addressId_fkey",
      columns: [table.addressId],
      foreignColumns: [AddressTable.id],
    }).onDelete("cascade"),
    index("employeeAddress_employeeId_idx").on(table.employeeId),
    index("employeeAddress_addressId_idx").on(table.addressId),
  ]
);

export const EmployeeAddressRelation = relations(
  EmployeeAddressTable,
  ({ one }) => ({
    employee: one(EmployeeTable, {
      fields: [EmployeeAddressTable.employeeId],
      references: [EmployeeTable.id],
      relationName: "EmployeeAddressToEmployee",
    }),
    address: one(AddressTable, {
      fields: [EmployeeAddressTable.addressId],
      references: [AddressTable.id],
      relationName: "EmployeeAddressToAddress",
    }),
  })
);

export const insertEmployeeAddressSchema = createInsertSchema(
  EmployeeAddressTable
).omit({
  id: true,
  createdAt: true,
});
export const selectEmployeeAddressSchema =
  createSelectSchema(EmployeeAddressTable);
export const updateEmployeeAddressSchema = createUpdateSchema(
  EmployeeAddressTable
).omit({
  id: true,
  createdAt: true,
});

export type EmployeeAddressDataModel = typeof EmployeeAddressTable.$inferSelect;
export type InsertEmployeeAddress = z.infer<typeof insertEmployeeAddressSchema>;
export type SelectEmployeeAddress = z.infer<typeof selectEmployeeAddressSchema>;
export type UpdateEmployeeAddress = z.infer<typeof updateEmployeeAddressSchema>;
