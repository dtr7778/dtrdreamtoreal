import { relations } from "drizzle-orm";
import { foreignKey, index, pgTable, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id } from "../../../db-utils";
import { SocialMediaTable } from "../socialMedia.table";
import { EmployeeTable } from "./employee.table";

export const EmployeeSocialTable = pgTable(
  "employee_socials",
  {
    id: db_id,
    employeeId: uuid("employee_id").notNull(),
    socialMediaId: uuid("social_media_id").notNull(),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "employeeSocial_employeeId_fkey",
      columns: [table.employeeId],
      foreignColumns: [EmployeeTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "employeeSocial_socialMediaId_fkey",
      columns: [table.socialMediaId],
      foreignColumns: [SocialMediaTable.id],
    }).onDelete("cascade"),
    index("employeeSocial_employeeId_idx").on(table.employeeId),
    index("employeeSocial_socialMediaId_idx").on(table.socialMediaId),
  ]
);

export const EmployeeSocialRelation = relations(
  EmployeeSocialTable,
  ({ one }) => ({
    employee: one(EmployeeTable, {
      fields: [EmployeeSocialTable.employeeId],
      references: [EmployeeTable.id],
      relationName: "EmployeeSocialToEmployee",
    }),
    social: one(SocialMediaTable, {
      fields: [EmployeeSocialTable.socialMediaId],
      references: [SocialMediaTable.id],
      relationName: "EmployeeSocialToSocial",
    }),
  })
);

export const insertEmployeeSocialSchema = createInsertSchema(
  EmployeeSocialTable
).omit({
  id: true,
  createdAt: true,
});
export const selectEmployeeSocialSchema =
  createSelectSchema(EmployeeSocialTable);

export type EmployeeSocialDataModel = typeof EmployeeSocialTable.$inferSelect;
export type InsertEmployeeSocial = z.infer<typeof insertEmployeeSocialSchema>;
export type SelectEmployeeSocial = z.infer<typeof selectEmployeeSocialSchema>;
