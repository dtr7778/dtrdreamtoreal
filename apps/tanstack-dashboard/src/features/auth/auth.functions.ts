import { DEFAULT_AUTH_PATH } from "#/constants";
import { getDB } from "#/lib/db";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { getUserRolesAndPermission } from "@workspace/lib/helpers";
import type { PermissionStrType, PermissionType } from "@workspace/lib/types";
import { hasPermission } from "@workspace/lib/utils";

import { getAuthSession } from "./auth.server";

export function requirePermissions(
  userPermissions: Array<PermissionType>,
  inputPermissions: Array<PermissionStrType>,
  userId?: string
) {
  const isAllowed = hasPermission(userPermissions, inputPermissions, {
    userId,
  });
  if (!isAllowed) {
    throw redirect({
      href: DEFAULT_AUTH_PATH,
      replace: true,
    });
  }
}

export const requireSessions = createServerFn({ method: "GET" }).handler(
  async () => {
    const requestHeaders = getRequestHeaders();

    const headers = new Headers();

    const cookie = requestHeaders.get("cookie");
    if (cookie) headers.set("cookie", cookie);
    const userAgent = requestHeaders.get("user-agent");
    if (userAgent) headers.set("user-agent", userAgent);

    const authSession = await getAuthSession(headers);

    if (!authSession) {
      return null;
    }

    const rolesPermissions = await getUserRolesAndPermission(
      authSession.user.id,
      getDB()
    );

    return {
      user: authSession.user,
      session: authSession.session,
      roles: rolesPermissions.roles,
      permissions: rolesPermissions.permissions,
    };
  }
);
