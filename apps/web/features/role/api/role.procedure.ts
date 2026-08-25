import { implement } from "@orpc/server";
import { countDistinct, eq, sql } from "drizzle-orm";

import {
  PermissionTable,
  RolePermissionTable,
  RoleTable,
  UserRoleTable,
} from "@workspace/drizzle/schemas";
import { jsonbAgg } from "@workspace/drizzle/sql-helpers";
import { apiResponse } from "@workspace/lib/utils";

import { API_MESSAGES } from "@/constants/apiMessage";
import {
  authMiddleware,
  userPermissionMiddleware,
} from "@/server/middleware/auth.middleware";
import { errorMiddleware } from "@/server/middleware/error.middleware";
import { privateRateLimitMiddleware } from "@/server/middleware/rateLimit.middleware";
import { ORPCContext } from "@/types/orpc.types";

import { roleContract } from "./role.contract";

export const roleImpl = implement(roleContract)
  .$context<ORPCContext>()
  .use(errorMiddleware)
  .use(privateRateLimitMiddleware)
  .use(authMiddleware);

export const listRoleProcedure = roleImpl.listRole
  .use(userPermissionMiddleware(["system.role-permission.list"]))
  .handler(async ({ context }) => {
    const result = await context.db
      .select({
        id: RoleTable.id,
        roleName: RoleTable.roleName,
        description: RoleTable.description,
        metadata: RoleTable.metadata,
        totalUsers: sql<number>`COALESCE(${countDistinct(UserRoleTable.userId)}, 0)::integer`,
        permissions: jsonbAgg(
          {
            id: PermissionTable.id,
            level: PermissionTable.level,
            action: PermissionTable.action,
            resource: PermissionTable.resource,
            description: PermissionTable.description,
            name: PermissionTable.name,
          },
          PermissionTable.id
        ),
      })
      .from(RoleTable)
      .leftJoin(UserRoleTable, eq(RoleTable.id, UserRoleTable.roleId))
      .leftJoin(
        RolePermissionTable,
        eq(RoleTable.id, RolePermissionTable.roleId)
      )
      .leftJoin(
        PermissionTable,
        eq(RolePermissionTable.permissionId, PermissionTable.id)
      )
      .groupBy(RoleTable.id);

    return apiResponse(API_MESSAGES.USER.ROLE.GET_ALL, result);
  });
