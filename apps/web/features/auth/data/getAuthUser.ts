import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/lib/better-auth/auth";

import { DEFAULT_AUTH_PATH, DEFAULT_UNAUTH_PATH } from "@/constants";
import { AuthSession, AuthUser } from "@/types";

import {
  getUserRolesAndPermission,
  getUserRolesAndPermissionCache,
} from "./getUserPermission";

export async function getAuthUser(): Promise<{
  user: AuthUser;
  session: AuthSession;
}> {
  const dbSession = await auth.api.getSession({
    headers: await headers(),
  });

  if (!dbSession) return redirect(DEFAULT_UNAUTH_PATH);

  return {
    session: dbSession.session,
    user: dbSession.user,
  };
}
export const getAuthUserCache = cache(
  async (): ReturnType<typeof getAuthUser> => await getAuthUser()
);

export async function getAuthUserWithRolesAndPermissions(): Promise<
  ReturnType<typeof getAuthUser> &
    ReturnType<typeof getUserRolesAndPermissionCache>
> {
  const { user, session } = await getAuthUser();

  const rolesAndPermissions = await getUserRolesAndPermission(user.id);

  if (!rolesAndPermissions) return redirect(DEFAULT_AUTH_PATH);

  return {
    session,
    user,
    roles: rolesAndPermissions.roles,
    permissions: rolesAndPermissions.permissions,
  };
}

export const getAuthUserWithRolesAndPermissionsCache = cache(
  async (): Promise<
    ReturnType<typeof getAuthUser> &
      ReturnType<typeof getAuthUserWithRolesAndPermissions>
  > => {
    const { user, session } = await getAuthUserCache();

    const rolesAndPermission = await getUserRolesAndPermissionCache(user.id);

    if (!rolesAndPermission) return redirect(DEFAULT_AUTH_PATH);

    return {
      session,
      user,
      roles: rolesAndPermission.roles,
      permissions: rolesAndPermission.permissions,
    };
  }
);
