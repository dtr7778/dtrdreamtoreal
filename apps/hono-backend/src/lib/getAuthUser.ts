import type { AuthSession, AuthType, AuthUser } from "@workspace/auth";
import { ApiError, UNAUTHORIZED } from "@workspace/server-core";

import { API_MESSAGES } from "@/constant";

export async function getAuthUser(
  auth: AuthType,
  headers: Headers
): Promise<{ user: AuthUser; session: AuthSession }> {
  const dbSession = await auth.api.getSession({ headers });

  if (!dbSession?.session || !dbSession?.user) {
    throw new ApiError({
      statusCode: UNAUTHORIZED,
      message: API_MESSAGES.GENERAL.UNAUTHORIZED,
    });
  }

  return {
    session: dbSession.session,
    user: dbSession.user,
  };
}
