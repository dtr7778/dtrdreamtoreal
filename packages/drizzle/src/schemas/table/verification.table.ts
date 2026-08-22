import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../db-utils";

export const VerificationTable = pgTable("verifications", {
  id: db_id,
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    precision: 3,
  }).notNull(),
  createdAt: db_created_at,
  updatedAt: db_updated_at,
});

export const insertVerificationSchema = createInsertSchema(
  VerificationTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectVerificationSchema = createSelectSchema(VerificationTable);
export const updateVerificationSchema = createUpdateSchema(VerificationTable);

export type VerificationDataModel = typeof VerificationTable.$inferSelect;
export type SelectVerification = z.infer<typeof selectVerificationSchema>;
export type InsertVerification = z.infer<typeof insertVerificationSchema>;
