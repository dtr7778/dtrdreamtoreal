import type { MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";

import { createDrizzleClient } from "@workspace/drizzle/client";
import { getUserRolesAndPermission } from "@workspace/lib/helpers";
import type { PermissionType } from "@workspace/lib/types";
import { hasPermission } from "@workspace/lib/utils";
import { ApiError, FORBIDDEN, UNAUTHORIZED } from "@workspace/server-core";

import { getAuth } from "@/lib/auth";
import { getAuthUser } from "@/lib/getAuthUser";

import { API_MESSAGES } from "@/constant";
import type { ApiBindings, AuthenticatedBindings } from "@/types";

export const authMiddleware: MiddlewareHandler<AuthenticatedBindings> =
  createMiddleware<AuthenticatedBindings>(async (c, next) => {
    const auth = getAuth(c.env);

    const { user, session } = await getAuthUser(auth, c.req.raw.headers);

    c.set("user", user);
    c.set("session", session);

    await next();
  });

export const permissionMiddleware = (
  requiredPermissions: PermissionType[]
): MiddlewareHandler<ApiBindings> =>
  createMiddleware<ApiBindings>(async (c, next) => {
    const user = c.get("user");
    const session = c.get("session");

    if (!session || !user) {
      throw new ApiError({
        statusCode: UNAUTHORIZED,
        message: API_MESSAGES.GENERAL.UNAUTHORIZED,
      });
    }

    const { permissions } = await getUserRolesAndPermission(
      user.id,
      createDrizzleClient(c.env.DB)
    );

    if (
      !hasPermission(permissions, requiredPermissions, {
        userId: user.id,
      })
    ) {
      throw new ApiError({
        statusCode: FORBIDDEN,
        message: API_MESSAGES.GENERAL.FORBIDDEN,
      });
    }

    await next();
  });
