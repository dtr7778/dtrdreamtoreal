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
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../db-utils";
import { ChatMessageTypeEnum } from "../../enums/db-enums";
import { UserTable } from "../user";
import { ChatMessageAttachmentTable } from "./chatMessageAttachment.table";
import { ChatMessageReactionTable } from "./chatMessageReaction.table";
import { ChatRoomTable } from "./chatRoom.table";
import { ChatRoomMemberTable } from "./chatRoomMember.table";

export type TiptapMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

export type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: Array<TiptapNode>;
  marks?: Array<TiptapMark>;
  text?: string;
};

export type TiptapDoc = {
  type: "doc";
  content?: Array<TiptapNode>;
};

export const ChatMessageTable = sqliteTable(
  "chat_messages",
  {
    id: db_id,
    roomId: text("room_id").notNull(),
    senderId: text("sender_id"),

    type: ChatMessageTypeEnum("type").notNull().default("text"),
    body: text("body", { mode: "json" }).$type<TiptapDoc | null>(),

    parentMessageId: text("parent_message_id"),
    replyToMessageId: text("reply_to_message_id"),

    threadReplyCount: integer("thread_reply_count").notNull().default(0),
    lastReplyAt: integer("last_reply_at", { mode: "timestamp_ms" }),

    editedAt: integer("edited_at", { mode: "timestamp_ms" }),

    metadata: text("metadata", { mode: "json" }).$type<
      Record<string, unknown>
    >(),

    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "chatMessage_roomId_fkey",
      columns: [table.roomId],
      foreignColumns: [ChatRoomTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "chatMessage_senderId_fkey",
      columns: [table.senderId],
      foreignColumns: [UserTable.id],
    }).onDelete("set null"),
    foreignKey({
      name: "chatMessage_parentMessageId_fkey",
      columns: [table.parentMessageId],
      foreignColumns: [table.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "chatMessage_replyToMessageId_fkey",
      columns: [table.replyToMessageId],
      foreignColumns: [table.id],
    }).onDelete("set null"),
    index("chatMessage_roomId_idx").on(table.roomId),
    index("chatMessage_senderId_idx").on(table.senderId),
    index("chatMessage_parentMessageId_idx").on(table.parentMessageId),
    index("chatMessage_replyToMessageId_idx").on(table.replyToMessageId),
    index("chatMessage_roomId_createdAt_idx").on(table.roomId, table.createdAt),
    index("chatMessage_createdAt_idx").on(table.createdAt),
  ]
);

export const ChatMessageRelations = relations(
  ChatMessageTable,
  ({ one, many }) => ({
    room: one(ChatRoomTable, {
      fields: [ChatMessageTable.roomId],
      references: [ChatRoomTable.id],
      relationName: "ChatMessageToChatRoom",
    }),
    sender: one(UserTable, {
      fields: [ChatMessageTable.senderId],
      references: [UserTable.id],
      relationName: "ChatMessageToSender",
    }),
    parentMessage: one(ChatMessageTable, {
      fields: [ChatMessageTable.parentMessageId],
      references: [ChatMessageTable.id],
      relationName: "ChatMessageToParent",
    }),
    replies: many(ChatMessageTable, {
      relationName: "ChatMessageToParent",
    }),
    replyToMessage: one(ChatMessageTable, {
      fields: [ChatMessageTable.replyToMessageId],
      references: [ChatMessageTable.id],
      relationName: "ChatMessageToReplyTo",
    }),
    repliedBy: many(ChatMessageTable, {
      relationName: "ChatMessageToReplyTo",
    }),
    readByMembers: many(ChatRoomMemberTable, {
      relationName: "ChatMessageToLastReadByMember",
    }),
    reactions: many(ChatMessageReactionTable, {
      relationName: "ChatMessageReactionToChatMessage",
    }),
    attachments: many(ChatMessageAttachmentTable, {
      relationName: "ChatMessageAttachmentToChatMessage",
    }),
  })
);

export const insertChatMessageSchema = createInsertSchema(ChatMessageTable, {
  roomId: z.uuid(),
  senderId: z.uuid().nullish(),
  parentMessageId: z.uuid().nullish(),
  replyToMessageId: z.uuid().nullish(),
})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    body: z.custom<TiptapDoc | null>().optional(),
  });
export const selectChatMessageSchema = createSelectSchema(ChatMessageTable, {
  id: z.uuid(),
  roomId: z.uuid(),
  senderId: z.uuid().nullish(),
  parentMessageId: z.uuid().nullish(),
  replyToMessageId: z.uuid().nullish(),
});
export const updateChatMessageSchema = createUpdateSchema(ChatMessageTable, {
  roomId: z.uuid().optional(),
  senderId: z.uuid().nullish(),
  parentMessageId: z.uuid().nullish(),
  replyToMessageId: z.uuid().nullish(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ChatMessageDataModel = typeof ChatMessageTable.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type SelectChatMessage = z.infer<typeof selectChatMessageSchema>;
export type UpdateChatMessage = z.infer<typeof updateChatMessageSchema>;
