import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type z from "zod";

import { db_created_at, db_id } from "../../db-utils";
import { UserTable } from "../user";
import { ChatMessageTable } from "./chatMessage.table";

export const ChatMessageReactionTable = sqliteTable(
  "chat_message_reactions",
  {
    id: db_id,
    messageId: text("message_id").notNull(),
    userId: text("user_id").notNull(),
    emoji: text("emoji").notNull(),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "chatMessageReaction_messageId_fkey",
      columns: [table.messageId],
      foreignColumns: [ChatMessageTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "chatMessageReaction_userId_fkey",
      columns: [table.userId],
      foreignColumns: [UserTable.id],
    }).onDelete("cascade"),
    uniqueIndex("chatMessageReaction_messageId_userId_emoji_key").on(
      table.messageId,
      table.userId,
      table.emoji
    ),
    index("chatMessageReaction_messageId_idx").on(table.messageId),
    index("chatMessageReaction_userId_idx").on(table.userId),
  ]
);

export const ChatMessageReactionRelations = relations(
  ChatMessageReactionTable,
  ({ one }) => ({
    message: one(ChatMessageTable, {
      fields: [ChatMessageReactionTable.messageId],
      references: [ChatMessageTable.id],
      relationName: "ChatMessageReactionToChatMessage",
    }),
    user: one(UserTable, {
      fields: [ChatMessageReactionTable.userId],
      references: [UserTable.id],
      relationName: "ChatMessageReactionToUser",
    }),
  })
);

export const insertChatMessageReactionSchema = createInsertSchema(
  ChatMessageReactionTable
).omit({ id: true, createdAt: true });
export const selectChatMessageReactionSchema = createSelectSchema(
  ChatMessageReactionTable
);

export type ChatMessageReactionDataModel =
  typeof ChatMessageReactionTable.$inferSelect;
export type InsertChatMessageReaction = z.infer<
  typeof insertChatMessageReactionSchema
>;
export type SelectChatMessageReaction = z.infer<
  typeof selectChatMessageReactionSchema
>;
