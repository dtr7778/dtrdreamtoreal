import { implement } from "@orpc/server";

import { apiResponse } from "@workspace/lib/utils";

import { auth } from "@/lib/better-auth/auth";

import { RESET_PASSWORD_PATH } from "@/constants";
import { API_MESSAGES } from "@/constants/apiMessage";
import {
  authMiddleware,
  getAuthData,
  getRolesAndPermissionsWithContext,
  userRoleMiddleware,
} from "@/server/middleware/auth.middleware";
import { errorMiddleware } from "@/server/middleware/error.middleware";
import { privateRateLimitMiddleware } from "@/server/middleware/rateLimit.middleware";
import { ORPCContext } from "@/types/orpc.types";
import { isAdmin } from "@/utils/user-utils";

import { authContract } from "./auth.contract";

export const authImpl = implement(authContract)
  .$context<ORPCContext>()
  .use(errorMiddleware);

export const authMetadataProcedure = authImpl.metadata.handler(
  async ({ context, errors }) => {
    const authData = await getAuthData(context);

    if (authData === null) {
      throw errors.UNAUTHORIZED();
    }

    const { user, session } = authData;

    const rolesAndPermissions = await getRolesAndPermissionsWithContext(
      user.id,
      context
    );

    if (rolesAndPermissions === null) {
      throw errors.UNAUTHORIZED();
    }

    const { roles, permissions } = rolesAndPermissions;

    const isAdminUser = isAdmin(roles);

    return apiResponse(API_MESSAGES.AUTH.METADATA, {
      user,
      session,
      roles,
      permissions,
      isAdminUser,
    });
  }
);

export const requestResetPasswordProcedure = authImpl.requestResetPassword
  .use(privateRateLimitMiddleware)
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    await auth.api.requestPasswordReset({
      body: {
        email: input.email,
        redirectTo: RESET_PASSWORD_PATH,
      },
      headers: context.reqHeaders,
    });

    return apiResponse(API_MESSAGES.AUTH.REQUEST_RESET_PASSWORD, null);
  });

export const userBanProcedure = authImpl.ban
  .use(privateRateLimitMiddleware)
  .use(authMiddleware)
  .use(userRoleMiddleware(["ADMIN", "SUPER_ADMIN"]))
  .handler(async ({ input, context }) => {
    if (input?.banned) {
      let banExpiresIn: number = 60 * 60 * 24 * 10;

      if (input.banExpires) {
        banExpiresIn = input.banExpires.getTime() - Date.now();
      }

      await auth.api.banUser({
        body: {
          userId: input.userId,
          banReason: input.banReason,
          banExpiresIn,
        },
        headers: context.reqHeaders,
      });

      return apiResponse(API_MESSAGES.AUTH.BAN, null);
    }

    await auth.api.unbanUser({
      body: {
        userId: input.userId,
      },
      headers: context.reqHeaders,
    });

    return apiResponse(API_MESSAGES.AUTH.UNBAN, null);
  });
