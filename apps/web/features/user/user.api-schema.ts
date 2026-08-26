import z from "zod";

import {
  RoleTable,
  selectRoleSchema,
  selectUserSchema,
  UserTable,
} from "@workspace/drizzle/schemas";
import { jsonbAgg } from "@workspace/drizzle/sql-helpers";
import { RoleEnumSchema } from "@workspace/drizzle/zod-db-enums";

export const roleColumnSql = jsonbAgg({
  id: RoleTable.id,
  roleName: RoleTable.roleName,
}).as("roles");

export const roleSqlSchema = selectRoleSchema
  .pick({
    id: true,
  })
  .extend({
    roleName: RoleEnumSchema,
  });

export const userProfileColumns = {
  id: UserTable.id,
  name: UserTable.name,
  email: UserTable.email,
  image: UserTable.image,
  roles: roleColumnSql,
};

export const userProfileSchema = selectUserSchema
  .pick({
    id: true,
    name: true,
    email: true,
    image: true,
  })
  .extend({
    roles: z.array(roleSqlSchema),
  });
export type UserProfileType = z.infer<typeof userProfileSchema>;
