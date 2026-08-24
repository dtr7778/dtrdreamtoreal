import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { RoleEnumSchema, RoleEnumType } from "@workspace/drizzle/zod-db-enums";

import { hasPermission, PermissionStrType } from "@/lib/permission";

import { DEFAULT_AUTH_PATH } from "@/constants";
import { getAuthUserWithRolesAndPermissionsWithOrgCache } from "@/features/auth/data/getAuthUser";

export function isAdmin(roles: Array<{ roleName: RoleEnumType | string }>) {
  return roles.some(
    ({ roleName }) =>
      roleName === RoleEnumSchema.enum.ADMIN ||
      roleName === RoleEnumSchema.enum.SUPER_ADMIN
  );
}

export const requireUserPermissionsWithOrgCache = cache(
  async (inputPermissions: Array<PermissionStrType>, resourceId?: string) => {
    const { session, user, permissions } =
      await getAuthUserWithRolesAndPermissionsWithOrgCache();

    if (
      !hasPermission(permissions, inputPermissions, {
        userId: user.id,
        resourceId,
      })
    ) {
      return redirect(DEFAULT_AUTH_PATH);
    }

    return {
      session,
      user,
    };
  }
);
