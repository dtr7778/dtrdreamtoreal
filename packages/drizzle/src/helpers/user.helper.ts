import z from "zod";

import {
  RoleTable,
  selectRoleSchema,
  selectUserSchema,
  UserTable,
} from "../schemas";
import { RoleEnumSchema } from "../schemas/enums/zod-db-enums";
import { jsonbAgg } from "../sql-helpers";

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
