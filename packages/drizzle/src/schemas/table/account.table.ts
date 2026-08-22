import {
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../db-utils";
import { UserTable } from "./user";

export const AccountTable = pgTable(
  "accounts",
  {
    id: db_id,
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
      precision: 6,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
      precision: 6,
    }),
    scope: text("scope"),
    password: text("password"),
    userId: uuid("user_id").notNull(),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "accounts_user_fkey",
      columns: [table.userId],
      foreignColumns: [UserTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    uniqueIndex("account_provider_account_id_key").on(
      table.providerId,
      table.accountId
    ),
    index("account_user_id_idx").on(table.userId),
  ]
);

export const AccountRelations = relations(AccountTable, ({ one }) => ({
  user: one(UserTable, {
    relationName: "AccountToUser",
    fields: [AccountTable.userId],
    references: [UserTable.id],
  }),
}));

export const insertAccountSchema = createInsertSchema(AccountTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectAccountSchema = createSelectSchema(AccountTable);
export const updateAccountSchema = createUpdateSchema(AccountTable);

export type AccountDataModel = typeof AccountTable.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type SelectAccount = z.infer<typeof selectAccountSchema>;
