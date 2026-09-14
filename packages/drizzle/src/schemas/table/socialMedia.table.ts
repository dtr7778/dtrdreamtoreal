import { relations } from "drizzle-orm";
import { index, pgTable, text, varchar } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../db-utils";
import {
  SocialMediaPlatfromTypeEnum,
  SocialMediaTypeEnum,
} from "../enums/db-enums";
import { CompanySocialTable, EmployeeSocialTable } from "./employee";

export const SocialMediaTable = pgTable(
  "social_media",
  {
    id: db_id,
    type: SocialMediaTypeEnum("type").notNull(),
    platform: SocialMediaPlatfromTypeEnum("platform").notNull(),

    username: varchar("username", { length: 256 }).notNull(),
    url: varchar("url").notNull(),
    displayName: varchar("display_name", { length: 256 }),

    notes: text("notes"),

    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [index("socialMedia_userName_idx").on(table.username)]
);

export const SocialMediaRelations = relations(SocialMediaTable, ({ many }) => ({
  employeeSocial: many(EmployeeSocialTable, {
    relationName: "EmployeeSocialToSocial",
  }),
  companySocial: many(CompanySocialTable, {
    relationName: "CompanySocialToSocial",
  }),
}));

export const insertSocialMediaSchema = createInsertSchema(SocialMediaTable, {
  url: z.url(),
}).omit({
  id: true,
  updatedAt: true,
  createdAt: true,
});
export const selectSocialMediaSchema = createSelectSchema(SocialMediaTable, {
  url: z.url(),
});
export const updateSocialMediaSchema = createUpdateSchema(SocialMediaTable, {
  url: z.url().optional(),
}).omit({
  id: true,
  updatedAt: true,
  createdAt: true,
});

export type SocialMediaDataModel = typeof SocialMediaTable.$inferSelect;
export type InsertSocialMedia = z.infer<typeof insertSocialMediaSchema>;
export type SelectSocialMedia = z.infer<typeof selectSocialMediaSchema>;
export type UpdateSocialMedia = z.infer<typeof updateSocialMediaSchema>;
