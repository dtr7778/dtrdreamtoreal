import { relations } from "drizzle-orm";
import { foreignKey, index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id } from "../../db-utils";
import { SocialMediaTable } from "../socialMedia.table";
import { LeadCompanyTable } from "./leadCompany.table";

export const LeadCompanySocialTable = sqliteTable(
  "lead_company_socials",
  {
    id: db_id,
    leadCompanyId: text("lead_company_id").notNull(),
    socialMediaId: text("social_media_id").notNull(),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "leadCompanySocial_leadCompanyId_fkey",
      columns: [table.leadCompanyId],
      foreignColumns: [LeadCompanyTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "leadCompanySocial_socialMediaId_fkey",
      columns: [table.socialMediaId],
      foreignColumns: [SocialMediaTable.id],
    }).onDelete("cascade"),
    index("leadCompanySocial_leadCompanyId_idx").on(table.leadCompanyId),
    index("leadCompanySocial_socialMediaId_idx").on(table.socialMediaId),
  ]
);

export const LeadCompanySocialRelation = relations(
  LeadCompanySocialTable,
  ({ one }) => ({
    leadCompany: one(LeadCompanyTable, {
      fields: [LeadCompanySocialTable.leadCompanyId],
      references: [LeadCompanyTable.id],
      relationName: "LeadCompanySocialToLeadCompany",
    }),
    social: one(SocialMediaTable, {
      fields: [LeadCompanySocialTable.socialMediaId],
      references: [SocialMediaTable.id],
      relationName: "LeadCompanySocialToSocial",
    }),
  })
);

export const insertLeadCompanySocialSchema = createInsertSchema(
  LeadCompanySocialTable,
  {
    leadCompanyId: z.uuid(),
    socialMediaId: z.uuid(),
  }
).omit({
  id: true,
  createdAt: true,
});
export const selectLeadCompanySocialSchema = createSelectSchema(
  LeadCompanySocialTable,
  {
    id: z.uuid(),
    leadCompanyId: z.uuid(),
    socialMediaId: z.uuid(),
  }
);

export type LeadCompanySocialDataModel =
  typeof LeadCompanySocialTable.$inferSelect;
export type InsertLeadCompanySocial = z.infer<
  typeof insertLeadCompanySocialSchema
>;
export type SelectLeadCompanySocial = z.infer<
  typeof selectLeadCompanySocialSchema
>;
