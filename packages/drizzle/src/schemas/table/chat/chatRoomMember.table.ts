import { relations, sql } from "drizzle-orm";
import {
  foreignKey,
  index,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import {
  db_bool,
  db_date,
  db_id,
  db_updated_at,
} from "../../../utils/db-utils";
import { ChatMemberRoleEnum } from "../../enums/db-enums";
import { UserTable } from "../user";
import { ChatMessageTable } from "./chatMessage.table";
import { ChatRoomTable } from "./chatRoom.table";

export const ChatRoomMemberTable = sqliteTable(
  "chat_room_members",
  {
    id: db_id,
    roomId: text("room_id").notNull(),
    userId: text("user_id").notNull(),

    role: ChatMemberRoleEnum("role").notNull().default("member"),
    isMuted: db_bool("is_muted").notNull().default(false),

    lastReadMessageId: text("last_read_message_id"),
    lastReadAt: db_date("last_read_at"),

    joinedAt: db_date("joined_at")
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "chatRoomMember_roomId_fkey",
      columns: [table.roomId],
      foreignColumns: [ChatRoomTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "chatRoomMember_userId_fkey",
      columns: [table.userId],
      foreignColumns: [UserTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "chatRoomMember_lastReadMessageId_fkey",
      columns: [table.lastReadMessageId],
      foreignColumns: [ChatMessageTable.id],
    }).onDelete("set null"),
    uniqueIndex("chatRoomMember_roomId_userId_key").on(
      table.roomId,
      table.userId
    ),
    index("chatRoomMember_roomId_idx").on(table.roomId),
    index("chatRoomMember_userId_idx").on(table.userId),
  ]
);

export const ChatRoomMemberRelations = relations(
  ChatRoomMemberTable,
  ({ one }) => ({
    room: one(ChatRoomTable, {
      fields: [ChatRoomMemberTable.roomId],
      references: [ChatRoomTable.id],
      relationName: "ChatRoomMemberToChatRoom",
    }),
    user: one(UserTable, {
      fields: [ChatRoomMemberTable.userId],
      references: [UserTable.id],
      relationName: "ChatRoomMemberToUser",
    }),
    lastReadMessage: one(ChatMessageTable, {
      fields: [ChatRoomMemberTable.lastReadMessageId],
      references: [ChatMessageTable.id],
      relationName: "ChatMessageToLastReadByMember",
    }),
  })
);

export const insertChatRoomMemberSchema = createInsertSchema(
  ChatRoomMemberTable,
  {
    roomId: z.uuid(),
    userId: z.uuid(),
    lastReadMessageId: z.uuid().nullish(),
  }
).omit({
  id: true,
  updatedAt: true,
});
export const selectChatRoomMemberSchema = createSelectSchema(
  ChatRoomMemberTable,
  {
    id: z.uuid(),
    roomId: z.uuid(),
    userId: z.uuid(),
    lastReadMessageId: z.uuid().nullish(),
  }
);
export const updateChatRoomMemberSchema = createUpdateSchema(
  ChatRoomMemberTable,
  {
    roomId: z.uuid().optional(),
    userId: z.uuid().optional(),
    lastReadMessageId: z.uuid().nullish(),
  }
).omit({
  id: true,
  joinedAt: true,
  updatedAt: true,
});

export type ChatRoomMemberDataModel = typeof ChatRoomMemberTable.$inferSelect;
export type InsertChatRoomMember = z.infer<typeof insertChatRoomMemberSchema>;
export type SelectChatRoomMember = z.infer<typeof selectChatRoomMemberSchema>;
export type UpdateChatRoomMember = z.infer<typeof updateChatRoomMemberSchema>;
