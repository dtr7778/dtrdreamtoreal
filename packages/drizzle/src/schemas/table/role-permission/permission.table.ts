import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  uniqueIndex,
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
  ActionTypeEnumType,
  PermissionLevelEnumType,
  ResourceTypeEnumType,
} from "../../enums/zod-db-enums";
import { RolePermissionTable } from "./rolePermission.table";

export const PermissionTable = pgTable(
  "permissions",
  {
    id: db_id,
    name: varchar("name", { length: 255 }).notNull(),
    level: varchar("level").$type<PermissionLevelEnumType>().notNull(),
    resource: varchar("resource").$type<ResourceTypeEnumType>().notNull(),
    action: varchar("action").$type<ActionTypeEnumType>().notNull(),
    description: varchar("description", { length: 255 }),
    metadata: jsonb("metadata"), // For additional context
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    uniqueIndex("permission_level_resource_action_key").on(
      table.level,
      table.resource,
      table.action
    ),
    index("permission_level_idx").on(table.level),
    index("permission_resource_idx").on(table.resource),
    index("permission_action_idx").on(table.action),
  ]
);

export const PermissionTableRelations = relations(
  PermissionTable,
  ({ many }) => ({
    rolePermissions: many(RolePermissionTable, {
      relationName: "PermissionToRolePermission",
    }),
  })
);

export const insertPermissionSchema = createInsertSchema(PermissionTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectPermissionSchema = createSelectSchema(PermissionTable);
export const updatePermissionSchema = createUpdateSchema(PermissionTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PermissionDataModel = typeof PermissionTable.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type SelectPermission = z.infer<typeof selectPermissionSchema>;
export type UpdatePermission = z.infer<typeof updatePermissionSchema>;
