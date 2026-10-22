import { relations } from "drizzle-orm";
import { foreignKey, index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import {
  db_bool,
  db_created_at,
  db_date,
  db_id,
  db_updated_at,
} from "../../../utils/db-utils";
import { ChatRoomTypeEnum } from "../../enums/db-enums";
import { FileTable } from "../file.table";
import { UserTable } from "../user";
import { ChatMessageTable } from "./chatMessage.table";
import { ChatRoomMemberTable } from "./chatRoomMember.table";

export const ChatRoomTable = sqliteTable(
  "chat_rooms",
  {
    id: db_id,

    type: ChatRoomTypeEnum("type").notNull(),
    name: text("name"),
    description: text("description"),
    imageFileId: text("image_file_id"),

    createdBy: text("created_by"),

    lastMessageAt: db_date("last_message_at"),

    isArchived: db_bool("is_archived").notNull().default(false),

    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "chatRoom_imageFileId_fkey",
      columns: [table.imageFileId],
      foreignColumns: [FileTable.id],
    }).onDelete("set null"),
    foreignKey({
      name: "chatRoom_createdBy_fkey",
      columns: [table.createdBy],
      foreignColumns: [UserTable.id],
    }).onDelete("set null"),
    index("chatRoom_type_idx").on(table.type),
    index("chatRoom_createdBy_idx").on(table.createdBy),
    index("chatRoom_lastMessageAt_idx").on(table.lastMessageAt),
    index("chatRoom_isArchived_idx").on(table.isArchived),
  ]
);

export const ChatRoomRelations = relations(ChatRoomTable, ({ one, many }) => ({
  imageFile: one(FileTable, {
    fields: [ChatRoomTable.imageFileId],
    references: [FileTable.id],
    relationName: "ChatRoomToImageFile",
  }),
  createdBy: one(UserTable, {
    fields: [ChatRoomTable.createdBy],
    references: [UserTable.id],
    relationName: "ChatRoomToCreatedBy",
  }),
  members: many(ChatRoomMemberTable, {
    relationName: "ChatRoomMemberToChatRoom",
  }),
  messages: many(ChatMessageTable, {
    relationName: "ChatMessageToChatRoom",
  }),
}));

export const insertChatRoomSchema = createInsertSchema(ChatRoomTable, {
  imageFileId: z.uuid().nullish(),
  createdBy: z.uuid().nullish(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectChatRoomSchema = createSelectSchema(ChatRoomTable, {
  id: z.uuid(),
  imageFileId: z.uuid().nullish(),
  createdBy: z.uuid().nullish(),
});
export const updateChatRoomSchema = createUpdateSchema(ChatRoomTable, {
  imageFileId: z.uuid().nullish(),
  createdBy: z.uuid().nullish(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ChatRoomDataModel = typeof ChatRoomTable.$inferSelect;
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type SelectChatRoom = z.infer<typeof selectChatRoomSchema>;
export type UpdateChatRoom = z.infer<typeof updateChatRoomSchema>;
