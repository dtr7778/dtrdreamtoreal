import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { db_id } from "../../../db-utils";
import { UserTable } from "../user";
import { RoleTable } from "./role.table";

export const UserRoleTable = pgTable(
  "user_roles",
  {
    id: db_id,
    roleId: uuid("role_id").notNull(),
    userId: uuid("user_id").notNull(),
    assignedAt: timestamp("assigned_at", {
      withTimezone: true,
      precision: 3,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      name: "fk_user_roles_role_id",
      columns: [table.roleId],
      foreignColumns: [RoleTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "fk_user_roles_user_id",
      columns: [table.userId],
      foreignColumns: [UserTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("user_role_unique").on(table.userId, table.roleId),
    index("user_role_role_id_idx").on(table.roleId),
    index("user_role_user_id_idx").on(table.userId),
  ]
);

export const UserRoleRelations = relations(UserRoleTable, ({ one }) => ({
  role: one(RoleTable, {
    fields: [UserRoleTable.roleId],
    references: [RoleTable.id],
    relationName: "UserRoleToRole",
  }),
  user: one(UserTable, {
    fields: [UserRoleTable.userId],
    references: [UserTable.id],
    relationName: "UserRoleToUser",
  }),
}));

export const insertUserRoleSchema = createInsertSchema(UserRoleTable).omit({
  id: true,
  assignedAt: true,
});
export const selectUserRoleSchema = createSelectSchema(UserRoleTable);

export type UserRoleDataModel = typeof UserRoleTable.$inferInsert;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
