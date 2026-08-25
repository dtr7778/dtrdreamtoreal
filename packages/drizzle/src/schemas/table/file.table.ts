import { relations } from "drizzle-orm";
import {
  bigint,
  foreignKey,
  index,
  pgTable,
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

import { db_id, db_soft_delete } from "../../db-utils";
import { FileEntityTypeEnumType } from "../enums/zod-db-enums";
import { UserTable } from "./user";

export const FileTable = pgTable(
  "files",
  {
    id: db_id,
    key: varchar("key", { length: 512 }).notNull(), // S3 object key
    filename: varchar("filename", { length: 255 }).notNull(),
    originalName: varchar("original_name", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 127 }).notNull(),
    size: bigint("size", { mode: "number" }).notNull(), // Size in bytes
    url: varchar("url").notNull(),
    uploadedBy: uuid("uploaded_by"),
    entityType: varchar("entity_type", {
      length: 50,
    }).$type<FileEntityTypeEnumType>(),
    entityId: uuid("entity_id"), // ID of the associated entity
    uploadedAt: timestamp("uploaded_at", {
      withTimezone: true,
      precision: 3,
    })
      .notNull()
      .defaultNow(),
    ...db_soft_delete,
  },
  (fileTable) => [
    foreignKey({
      name: "files_user_fkey",
      columns: [fileTable.uploadedBy],
      foreignColumns: [UserTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "files_deleted_by_fkey",
      columns: [fileTable.deletedBy],
      foreignColumns: [UserTable.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    index("files_user_idx").on(fileTable.uploadedBy),
    index("files_deleted_by_idx").on(fileTable.deletedBy),
    index("files_entity_idx").on(fileTable.entityType, fileTable.entityId),
    index("files_key_idx").on(fileTable.key),
    index("files_uploaded_at_idx").on(fileTable.uploadedAt),
  ]
);

export const FileRelations = relations(FileTable, ({ one }) => ({
  uploadedBy: one(UserTable, {
    fields: [FileTable.uploadedBy],
    references: [UserTable.id],
    relationName: "FileUploadedBy",
  }),
  deletedBy: one(UserTable, {
    fields: [FileTable.deletedBy],
    references: [UserTable.id],
    relationName: "FileDeletedBy",
  }),
}));

export const insertFileSchema = createInsertSchema(FileTable).omit({
  id: true,
  uploadedAt: true,
  deletedAt: true,
  deletedBy: true,
});
export const selectFileSchema = createSelectSchema(FileTable);
export const updateFileSchema = createUpdateSchema(FileTable).omit({
  id: true,
  uploadedAt: true,
  deletedBy: true,
  deletedAt: true,
});

export type FileDataModel = typeof FileTable.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type SelectFile = z.infer<typeof selectFileSchema>;
