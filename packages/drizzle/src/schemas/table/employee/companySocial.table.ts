import { relations } from "drizzle-orm";
import { foreignKey, index, pgTable, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id } from "../../../db-utils";
import { SocialMediaTable } from "../socialMedia.table";
import { CompanyTable } from "./company.table";

export const CompanySocialTable = pgTable(
  "company_socials",
  {
    id: db_id,
    companyId: uuid("company_id").notNull(),
    socialMediaId: uuid("social_media_id").notNull(),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "companySocial_companyId_fkey",
      columns: [table.companyId],
      foreignColumns: [CompanyTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "companySocial_socialMediaId_fkey",
      columns: [table.socialMediaId],
      foreignColumns: [SocialMediaTable.id],
    }).onDelete("cascade"),
    index("companySocial_companyId_idx").on(table.companyId),
    index("companySocial_socialMediaId_idx").on(table.socialMediaId),
  ]
);

export const CompanySocialRelation = relations(CompanySocialTable, ({ one }) => ({
  company: one(CompanyTable, {
    fields: [CompanySocialTable.companyId],
    references: [CompanyTable.id],
    relationName: "CompanySocialToCompany",
  }),
  social: one(SocialMediaTable, {
    fields: [CompanySocialTable.socialMediaId],
    references: [SocialMediaTable.id],
    relationName: "CompanySocialToSocial",
  }),
}));

export const insertCompanySocialSchema = createInsertSchema(CompanySocialTable).omit({
  id: true,
  createdAt: true,
});
export const selectCompanySocialSchema = createSelectSchema(CompanySocialTable);

export type CompanySocialDataModel = typeof CompanySocialTable.$inferSelect;
export type InsertCompanySocial = z.infer<typeof insertCompanySocialSchema>;
export type SelectCompanySocial = z.infer<typeof selectCompanySocialSchema>;
