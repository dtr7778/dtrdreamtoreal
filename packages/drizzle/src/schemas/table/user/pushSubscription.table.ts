import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../db-utils";
import { UserTable } from "./user.table";

export const PushSubscriptionTable = sqliteTable(
  "push_subscriptions",
  {
    id: db_id,
    userId: text("user_id").notNull(),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    expirationTime: real("expiration_time"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "push_subscription_user_fkey",
      columns: [table.userId],
      foreignColumns: [UserTable.id],
    })
      .onDelete("cascade"),
    uniqueIndex("push_subscription_endpoint_unique").on(table.endpoint),
    index("push_subscription_user_id").on(table.userId),
  ]
);

export const PushSubscriptionRelations = relations(
  PushSubscriptionTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [PushSubscriptionTable.userId],
      references: [UserTable.id],
      relationName: "PushSubscriptionToUser",
    }),
  })
);

export const insertPushSubscriptionSchema = createInsertSchema(
  PushSubscriptionTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectPushSubscriptionSchema = createSelectSchema(
  PushSubscriptionTable
);
export const updatePushSubscriptionSchema = createUpdateSchema(
  PushSubscriptionTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PushSubscriptionDataModel =
  typeof PushSubscriptionTable.$inferSelect;
export type SelectPushSubscription = z.infer<
  typeof selectPushSubscriptionSchema
>;
export type InsertPushSubscription = z.infer<
  typeof insertPushSubscriptionSchema
>;
export type UpdatePushSubscription = z.infer<
  typeof updatePushSubscriptionSchema
>;
