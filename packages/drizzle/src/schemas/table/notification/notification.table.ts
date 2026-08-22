import { relations } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import {
  NotificationCategoryEnum,
  NotificationLevelEnum,
} from "../../enums/db-enums";
import { UserTable } from "../user";

export const NotificationTable = pgTable(
  "notifications",
  {
    id: db_id,
    recipientId: uuid("recipient_id").notNull(),
    actorId: uuid("actor_id"),
    category: NotificationCategoryEnum("category").notNull(),
    level: NotificationLevelEnum("level").default("INFO").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    data: jsonb("data"), // Stores contextual information (e.g., leadId, action links)
    isRead: boolean("is_read").default(false).notNull(),
    readAt: timestamp("read_at", { withTimezone: true, precision: 3 }),
    isArchived: boolean("is_archived").default(false).notNull(),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "notifications_recipient_fkey",
      columns: [table.recipientId],
      foreignColumns: [UserTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "notifications_actor_fkey",
      columns: [table.actorId],
      foreignColumns: [UserTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
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
