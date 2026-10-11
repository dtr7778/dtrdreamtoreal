import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../db-utils";
import {
  NotificationCategoryEnum,
  NotificationLevelEnum,
} from "../../enums/db-enums";
import { UserTable } from "../user";

export const NotificationTable = sqliteTable(
  "notifications",
  {
    id: db_id,
    recipientId: text("recipient_id").notNull(),
    actorId: text("actor_id"),
    category: NotificationCategoryEnum("category").notNull(),
    level: NotificationLevelEnum("level").default("INFO").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    data: text("data", { mode: "json" }), // Stores contextual information (e.g., leadId, action links)
    isRead: integer("is_read", { mode: "boolean" }).default(false).notNull(),
    readAt: integer("read_at", { mode: "timestamp_ms" }),
    isArchived: integer("is_archived", { mode: "boolean" })
      .default(false)
      .notNull(),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "notifications_recipient_fkey",
      columns: [table.recipientId],
      foreignColumns: [UserTable.id],
    })
      .onDelete("cascade"),
    foreignKey({
      name: "notifications_actor_fkey",
      columns: [table.actorId],
      foreignColumns: [UserTable.id],
    })
      .onDelete("set null"),
    index("notifications_recipient_idx").on(table.recipientId),
    index("notifications_recipient_read_idx").on(
      table.recipientId,
      table.isRead
    ),
    index("notifications_created_at_idx").on(table.createdAt),
  ]
);

export const NotificationRelations = relations(
  NotificationTable,
  ({ one }) => ({
    recipient: one(UserTable, {
      fields: [NotificationTable.recipientId],
      references: [UserTable.id],
      relationName: "NotificationToRecipient",
    }),
    actor: one(UserTable, {
      fields: [NotificationTable.actorId],
      references: [UserTable.id],
      relationName: "NotificationToActor",
    }),
  })
);

export const insertNotificationSchema = createInsertSchema(
  NotificationTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectNotificationSchema = createSelectSchema(NotificationTable);
export const updateNotificationSchema = createUpdateSchema(
  NotificationTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type NotificationDataModel = typeof NotificationTable.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type SelectNotification = z.infer<typeof selectNotificationSchema>;
export type UpdateNotification = z.infer<typeof updateNotificationSchema>;
