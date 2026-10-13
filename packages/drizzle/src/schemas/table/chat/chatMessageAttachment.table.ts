import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type z from "zod";

import { db_created_at, db_id } from "../../db-utils";
import { FileTable } from "../file.table";
import { ChatMessageTable } from "./chatMessage.table";

export const ChatMessageAttachmentTable = sqliteTable(
  "chat_message_attachments",
  {
    id: db_id,
    messageId: text("message_id").notNull(),
    fileId: text("file_id").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "chatMessageAttachment_messageId_fkey",
      columns: [table.messageId],
      foreignColumns: [ChatMessageTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "chatMessageAttachment_fileId_fkey",
      columns: [table.fileId],
      foreignColumns: [FileTable.id],
    }).onDelete("cascade"),
    uniqueIndex("chatMessageAttachment_messageId_fileId_key").on(
      table.messageId,
      table.fileId
    ),
    index("chatMessageAttachment_messageId_idx").on(table.messageId),
    index("chatMessageAttachment_fileId_idx").on(table.fileId),
  ]
);

export const ChatMessageAttachmentRelations = relations(
  ChatMessageAttachmentTable,
  ({ one }) => ({
    message: one(ChatMessageTable, {
      fields: [ChatMessageAttachmentTable.messageId],
      references: [ChatMessageTable.id],
      relationName: "ChatMessageAttachmentToChatMessage",
    }),
    file: one(FileTable, {
      fields: [ChatMessageAttachmentTable.fileId],
      references: [FileTable.id],
      relationName: "ChatMessageAttachmentToFile",
    }),
  })
);

export const insertChatMessageAttachmentSchema = createInsertSchema(
  ChatMessageAttachmentTable
).omit({ id: true, createdAt: true });
export const selectChatMessageAttachmentSchema = createSelectSchema(
  ChatMessageAttachmentTable
);

export type ChatMessageAttachmentDataModel =
  typeof ChatMessageAttachmentTable.$inferSelect;
export type InsertChatMessageAttachment = z.infer<
  typeof insertChatMessageAttachmentSchema
>;
export type SelectChatMessageAttachment = z.infer<
  typeof selectChatMessageAttachmentSchema
>;
