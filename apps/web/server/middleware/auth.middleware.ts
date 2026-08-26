import { NextRequest } from "next/server";

import { ORPCError } from "@orpc/client";

import { RoleEnumType } from "@workspace/drizzle/zod-db-enums";

import { auth } from "@/lib/better-auth/auth";
import { hasPermission } from "@/lib/permission";

import { getUserRolesAndPermission } from "@/features/auth/data/getUserPermission";
import { AuthSession, AuthUser, PermissionStrType } from "@/types";
import { ORPCContext } from "@/types/orpc.types";

import { baseOs } from "../orpc.base";

async function getAuthUser(
  headers: NextRequest["headers"]
): Promise<{ user: AuthUser; session: AuthSession } | null> {
  const dbSession = await auth.api.getSession({ headers });

  if (!dbSession) return null;

  return {
    session: dbSession.session,
    user: dbSession.user,
  };
}

export async function getAuthData(
  context: ORPCContext
): Promise<Awaited<ReturnType<typeof getAuthUser>> | null> {
  try {
    // Case 1: Auth data already in context
    if (context.session != null && context.user != null) {
      return {
        session: context.session,
        user: context.user,
      };
    }

    // Case 2: Fetch auth data from headers
    const sessionData = await getAuthUser(context.reqHeaders);

    if (sessionData?.session && sessionData?.user) {
      return sessionData;
    }

    return null;
  } catch (err) {
    if (err instanceof ORPCError) throw err;
    return null;
  }
}

export async function getRolesAndPermissionsWithContext(
  userId: string,
  context: ORPCContext
): Promise<Awaited<ReturnType<typeof getUserRolesAndPermission>> | null> {
  try {
    if (
      context.roles != null &&
      context.roles.length > 0 &&
      context.permissions != null &&
      context.permissions.length > 0
    ) {
      return {
        roles: context.roles,
        permissions: context.permissions,
      };
    }

    const rolesAndPermissions = await getUserRolesAndPermission(
      userId,
      context.db
    );

    if (!rolesAndPermissions) {
      return null;
    }

    return rolesAndPermissions;
  } catch (err) {
    if (err instanceof ORPCError) throw err;
    return null;
  }
}

export function validateRoles(
  requiredRoles: Array<string>,
  userRoles: Array<{ roleName: string }>
): boolean {
  const userRolesSet = new Set<string>(userRoles.map((role) => role.roleName));

  if (requiredRoles.some((role) => userRolesSet.has(role))) {
    return true;
  }

  return false;
}

export const authMiddleware = baseOs.middleware(
  async ({ context, next, errors }) => {
    if (context.session != null && context.user != null) {
      return next({
        context: {
          session: context.session,
          user: context.user,
        },
      });
    }

    const authData = await getAuthData(context);

    if (!authData) {
      throw errors.UNAUTHORIZED();
    }

    return next({
      context: {
        session: authData.session,
        user: authData.user,
      },
    });
  }
);

export function userRoleMiddleware(roles: Array<RoleEnumType>) {
  return baseOs.middleware(async ({ context, next, errors }) => {
    const authData = await getAuthData(context);

    if (!authData) {
      throw errors.UNAUTHORIZED();
    }

    const rolesAndPermissions = await getRolesAndPermissionsWithContext(
      authData.user.id,
      context
    );

    if (!rolesAndPermissions) {
      throw errors.UNAUTHORIZED();
    }

    if (!validateRoles(roles, rolesAndPermissions.roles)) {
      throw errors.FORBIDDEN();
    }

    return next({
      context: {
        session: authData.session,
        user: authData.user,
        roles: rolesAndPermissions.roles,
        permissions: rolesAndPermissions.permissions,
      },
    });
  });
}

export function userPermissionMiddleware(
  permissions: Array<PermissionStrType>
) {
  return baseOs.middleware(async ({ context, next, errors }) => {
    const authData = await getAuthData(context);

    if (!authData) {
      throw errors.UNAUTHORIZED();
    }

    const rolesAndPermissions = await getRolesAndPermissionsWithContext(
      authData.user.id,
      context
    );

    if (!rolesAndPermissions) {
      throw errors.UNAUTHORIZED();
    }

    if (
      !hasPermission(rolesAndPermissions.permissions, permissions, {
        userId: authData.user.id,
      })
    ) {
      throw errors.FORBIDDEN();
    }

    return next({
      context: {
        session: authData.session,
        user: authData.user,
        roles: rolesAndPermissions.roles,
        permissions: rolesAndPermissions.permissions,
      },
    });
  });
}
