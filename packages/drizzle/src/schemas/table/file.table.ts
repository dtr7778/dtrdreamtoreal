import { relations, sql } from "drizzle-orm";
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

import { db_id, db_soft_delete } from "../db-utils";
import {
  FileEntityTypeEnumSchema,
  type FileEntityTypeEnumType,
} from "../enums/zod-db-enums";
import { ChatMessageAttachmentTable, ChatRoomTable } from "./chat";
import { UserTable } from "./user";

export const FileTable = sqliteTable(
  "files",
  {
    id: db_id,
    key: text("key").notNull(), // S3 object key
    filename: text("filename").notNull(),
    originalName: text("original_name").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(), // Size in bytes
    url: text("url").notNull(),
    uploadedBy: text("uploaded_by"),
    entityType: text("entity_type").$type<FileEntityTypeEnumType>(),
    entityId: text("entity_id"), // ID of the associated entity
    uploadedAt: integer("uploaded_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    ...db_soft_delete,
  },
  (fileTable) => [
    foreignKey({
      name: "file_user_fkey",
      columns: [fileTable.uploadedBy],
      foreignColumns: [UserTable.id],
    }).onDelete("set null"),
    foreignKey({
      name: "file_deletedBy_fkey",
      columns: [fileTable.deletedBy],
      foreignColumns: [UserTable.id],
    }).onDelete("set null"),
    index("file_user_idx").on(fileTable.uploadedBy),
    index("file_deletedBy_idx").on(fileTable.deletedBy),
    index("file_entityType_idx").on(fileTable.entityType, fileTable.entityId),
    index("file_key_idx").on(fileTable.key),
    index("file_uploadedAt_idx").on(fileTable.uploadedAt),
  ]
);

export const FileRelations = relations(FileTable, ({ one, many }) => ({
  uploadedBy: one(UserTable, {
    fields: [FileTable.uploadedBy],
    references: [UserTable.id],
    relationName: "FileUploadedToUser",
  }),
  deletedBy: one(UserTable, {
    fields: [FileTable.deletedBy],
    references: [UserTable.id],
    relationName: "FileDeletedToUser",
  }),
  chatRoomImages: many(ChatRoomTable, {
    relationName: "ChatRoomToImageFile",
  }),
  chatMessageAttachments: many(ChatMessageAttachmentTable, {
    relationName: "ChatMessageAttachmentToFile",
  }),
}));

export const insertFileSchema = createInsertSchema(FileTable, {
  entityType: FileEntityTypeEnumSchema.optional(),
  entityId: z.uuid().nullish(),
  uploadedBy: z.uuid().nullish(),
}).omit({
  id: true,
  uploadedAt: true,
  deletedAt: true,
  deletedBy: true,
});
export const selectFileSchema = createSelectSchema(FileTable, {
  entityType: FileEntityTypeEnumSchema.optional(),
  id: z.uuid(),
  entityId: z.uuid().nullish(),
  uploadedBy: z.uuid().nullish(),
  deletedBy: z.uuid().nullish(),
});
export const updateFileSchema = createUpdateSchema(FileTable, {
  entityType: FileEntityTypeEnumSchema.optional(),
  entityId: z.uuid().nullish(),
  uploadedBy: z.uuid().nullish(),
}).omit({
  id: true,
  uploadedAt: true,
  deletedBy: true,
  deletedAt: true,
});

export type FileDataModel = typeof FileTable.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type SelectFile = z.infer<typeof selectFileSchema>;
export type UpdateFile = z.infer<typeof updateFileSchema>;
