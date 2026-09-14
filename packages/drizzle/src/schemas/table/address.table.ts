import { relations } from "drizzle-orm";
import { numeric, pgTable, text, varchar } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../db-utils";
import { AddressTypeEnum } from "../enums/db-enums";
import { CompanyAddressTable, EmployeeAddressTable } from "./employee";

export const AddressTable = pgTable("addresses", {
  id: db_id,

  type: AddressTypeEnum("type").notNull().default("other"),

  streetLine1: varchar("street_line_1", { length: 255 }).notNull(),
  streetLine2: varchar("street_line_2", { length: 255 }),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }),
  zipCode: varchar("zip_code", { length: 20 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),

  latitude: numeric("latitude", { precision: 9, scale: 6 }),
  longitude: numeric("longitude", { precision: 9, scale: 6 }),

  notes: text("notes"),

  createdAt: db_created_at,
  updatedAt: db_updated_at,
});

export const AddressRelations = relations(AddressTable, ({ many }) => ({
  employeeAddresses: many(EmployeeAddressTable, {
    relationName: "EmployeeAddressToAddress",
  }),
  companyAddresses: many(CompanyAddressTable, {
    relationName: "CompanyAddressToAddress",
  }),
}));

export const insertAddressSchema = createInsertSchema(AddressTable).omit({
  id: true,
  updatedAt: true,
  createdAt: true,
});
export const selectAddressSchema = createSelectSchema(AddressTable);
export const updateAddressSchema = createUpdateSchema(AddressTable).omit({
  id: true,
  updatedAt: true,
  createdAt: true,
});

export type AddressDataModel = typeof AddressTable.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type SelectAddress = z.infer<typeof selectAddressSchema>;
export type UpdateAddress = z.infer<typeof updateAddressSchema>;
