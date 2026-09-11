import { relations } from "drizzle-orm";
import { foreignKey, index, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id } from "../../../db-utils";
import { EmailRecipientTypeEnum } from "../../enums/db-enums";
import { EmailTable } from "./email.table";

export const EmailRecipientTable = pgTable(
  "email_recipients",
  {
    id: db_id,
    emailId: uuid("email_id").notNull(),
    type: EmailRecipientTypeEnum("type").notNull(),
    email: varchar("email").notNull(),
    name: varchar("name"),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "emailRecipient_email_fkey",
      columns: [table.emailId],
      foreignColumns: [EmailTable.id],
    }).onDelete("cascade"),
    index("emailRecipient_emailId_idx").on(table.emailId),
    index("emailRecipient_email_idx").on(table.email),
    index("emailRecipient_type_idx").on(table.type),
  ]
);

export const EmailRecipientRelations = relations(
  EmailRecipientTable,
  ({ one }) => ({
    email: one(EmailTable, {
      fields: [EmailRecipientTable.emailId],
      references: [EmailTable.id],
      relationName: "EmailRecipientToEmail",
    }),
  })
);

export const insertEmailRecipientSchema = createInsertSchema(
  EmailRecipientTable,
  {
    email: z.email(),
  }
).omit({ id: true, createdAt: true });
export const selectEmailRecipientSchema = createSelectSchema(
  EmailRecipientTable,
  {
    email: z.email(),
  }
);

export type EmailRecipientDataModel = typeof EmailRecipientTable.$inferSelect;
export type InsertEmailRecipient = z.infer<typeof insertEmailRecipientSchema>;
export type SelectEmailRecipient = z.infer<typeof selectEmailRecipientSchema>;
