import z from "zod";

import {
  RoleTable,
  selectRoleSchema,
  selectUserSchema,
  UserTable,
} from "@workspace/drizzle/schemas";
import { jsonbAgg } from "@workspace/drizzle/sql-helpers";

export const roleColumnSql = jsonbAgg({
  id: RoleTable.id,
  roleName: RoleTable.roleName,
}).as("roles");

export const roleSqlSchema = selectRoleSchema
  .pick({
    id: true,
  })
  .extend({
    roleName: z.string(),
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
    name: true,
    email: true,
    image: true,
  })
  .extend({
    userId: z.uuid(),
    orgMemberId: z.uuid(),
    roles: z.array(roleSqlSchema),
  });
export type UserProfileType = z.infer<typeof userProfileSchema>;
