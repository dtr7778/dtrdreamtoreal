import { relations } from "drizzle-orm";
import { foreignKey, index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import { UserTable } from "../user";
import { FeedbackIssueTable } from "./feedbackIssue.table";

export const FeedbackIssueReplyTable = pgTable(
  "feedback_issue_replies",
  {
    id: db_id,
    issueId: uuid("issue_id").notNull(),
    content: text("content").notNull(),
    createdBy: uuid("created_by_id").notNull(),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "feedback_issue_replies_issue_fkey",
      columns: [table.issueId],
      foreignColumns: [FeedbackIssueTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "feedback_issue_replies_createdBy_fkey",
      columns: [table.createdBy],
      foreignColumns: [UserTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("feedback_issue_replies_issue_idx").on(table.issueId),
    index("feedback_issue_replies_createdBy_idx").on(table.createdBy),
  ]
);

export const FeedbackIssueReplyRelations = relations(
  FeedbackIssueReplyTable,
  ({ one }) => ({
    issue: one(FeedbackIssueTable, {
      fields: [FeedbackIssueReplyTable.issueId],
      references: [FeedbackIssueTable.id],
      relationName: "FeedbackIssueReplyToIssue",
    }),
    user: one(UserTable, {
      fields: [FeedbackIssueReplyTable.createdBy],
      references: [UserTable.id],
      relationName: "FeedbackIssueReplyToCreatedBy",
    }),
  })
);

export const insertFeedbackIssueReplySchema = createInsertSchema(
  FeedbackIssueReplyTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectFeedbackIssueReplySchema = createSelectSchema(
  FeedbackIssueReplyTable
);
export const updateFeedbackIssueReplySchema = createUpdateSchema(
  FeedbackIssueReplyTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type FeedbackIssueReplyDataModel =
  typeof FeedbackIssueReplyTable.$inferSelect;
export type InsertFeedbackIssueReply = z.infer<
  typeof insertFeedbackIssueReplySchema
>;
export type SelectFeedbackIssueReply = z.infer<
  typeof selectFeedbackIssueReplySchema
>;
export type UpdateFeedbackIssueReply = z.infer<
  typeof updateFeedbackIssueReplySchema
>;
