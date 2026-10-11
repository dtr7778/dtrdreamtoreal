import { relations } from "drizzle-orm";
import { foreignKey, index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type z from "zod";

import { db_created_at, db_id } from "../../db-utils";
import { SocialMediaTable } from "../socialMedia.table";
import { LeadUserTable } from "./leadUser.table";

export const LeadUserSocialTable = sqliteTable(
  "lead_user_socials",
  {
    id: db_id,
    leadUserId: text("lead_user_id").notNull(),
    socialMediaId: text("social_media_id").notNull(),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "leadUserSocial_leadUserId_fkey",
      columns: [table.leadUserId],
      foreignColumns: [LeadUserTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "leadUserSocial_socialMediaId_fkey",
      columns: [table.socialMediaId],
      foreignColumns: [SocialMediaTable.id],
    }).onDelete("cascade"),
    index("leadUserSocial_leadUserId_idx").on(table.leadUserId),
    index("leadUserSocial_socialMediaId_idx").on(table.socialMediaId),
  ]
);

export const LeadUserSocialRelation = relations(
  LeadUserSocialTable,
  ({ one }) => ({
    leadUser: one(LeadUserTable, {
      fields: [LeadUserSocialTable.leadUserId],
      references: [LeadUserTable.id],
      relationName: "LeadUserSocialToLeadUser",
    }),
    social: one(SocialMediaTable, {
      fields: [LeadUserSocialTable.socialMediaId],
      references: [SocialMediaTable.id],
      relationName: "LeadUserSocialToSocial",
    }),
  })
);

export const insertLeadUserSocialSchema = createInsertSchema(
  LeadUserSocialTable
).omit({
  id: true,
  createdAt: true,
});
export const selectLeadUserSocialSchema =
  createSelectSchema(LeadUserSocialTable);

export type LeadUserSocialDataModel = typeof LeadUserSocialTable.$inferSelect;
export type InsertLeadUserSocial = z.infer<typeof insertLeadUserSocialSchema>;
export type SelectLeadUserSocial = z.infer<typeof selectLeadUserSocialSchema>;
