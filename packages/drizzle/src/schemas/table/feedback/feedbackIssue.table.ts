import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
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
  FeedbackIssueStatusEnum,
  FeedbackIssueTypeEnum,
} from "../../enums/db-enums";
import { UserTable } from "../user";
import { FeedbackIssueReplyTable } from "./feedbackIssueReply.table";

export const FeedbackIssueTable = pgTable(
  "feedback_issues",
  {
    id: db_id,
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    type: FeedbackIssueTypeEnum("type").notNull(),
    status: FeedbackIssueStatusEnum("status").notNull().default("OPEN"),
    closedAt: timestamp("closed_at", { withTimezone: true, precision: 3 }),
    createdBy: uuid("created_by_id").notNull(),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "feedback_issues_createdBy_fkey",
      columns: [table.createdBy],
      foreignColumns: [UserTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("feedback_issues_createdBy_idx").on(table.createdBy),
    index("feedback_issues_status_idx").on(table.status),
    index("feedback_issues_type_idx").on(table.type),
    index("feedback_issues_created_at_idx").on(table.createdAt),
  ]
);

export const FeedbackIssueRelations = relations(
  FeedbackIssueTable,
  ({ many, one }) => ({
    user: one(UserTable, {
      fields: [FeedbackIssueTable.createdBy],
      references: [UserTable.id],
      relationName: "FeedbackIssueToCreatedBy",
    }),
    replies: many(FeedbackIssueReplyTable, {
      relationName: "FeedbackIssueReplyToIssue",
    }),
  })
);

export const insertFeedbackIssueSchema = createInsertSchema(
  FeedbackIssueTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectFeedbackIssueSchema = createSelectSchema(FeedbackIssueTable);
export const updateFeedbackIssueSchema = createUpdateSchema(
  FeedbackIssueTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type FeedbackIssueDataModel = typeof FeedbackIssueTable.$inferSelect;
export type InsertFeedbackIssue = z.infer<typeof insertFeedbackIssueSchema>;
export type SelectFeedbackIssue = z.infer<typeof selectFeedbackIssueSchema>;
export type UpdateFeedbackIssue = z.infer<typeof updateFeedbackIssueSchema>;
