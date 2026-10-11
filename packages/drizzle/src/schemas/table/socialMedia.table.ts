import { relations } from "drizzle-orm";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../db-utils";
import {
  SocialMediaPlatfromTypeEnum,
  SocialMediaTypeEnum,
} from "../enums/db-enums";
import { LeadCompanySocialTable, LeadUserSocialTable } from "./lead";

export const SocialMediaTable = sqliteTable(
  "social_media",
  {
    id: db_id,
    type: SocialMediaTypeEnum("type").notNull(),
    platform: SocialMediaPlatfromTypeEnum("platform").notNull(),

    username: text("username").notNull(),
    url: text("url").notNull(),
    displayName: text("display_name"),

    notes: text("notes"),

    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [index("socialMedia_userName_idx").on(table.username)]
);

export const SocialMediaRelations = relations(SocialMediaTable, ({ many }) => ({
  leadUserSocial: many(LeadUserSocialTable, {
    relationName: "LeadUserSocialToSocial",
  }),
  leadCompanySocial: many(LeadCompanySocialTable, {
    relationName: "LeadCompanySocialToSocial",
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
