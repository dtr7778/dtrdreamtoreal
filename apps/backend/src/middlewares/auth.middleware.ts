import { fromNodeHeaders } from "better-auth/node";
import { inject, injectable } from "inversify";

import type { AuthType } from "@workspace/auth";
import { type DatabaseType } from "@workspace/drizzle/types";
import type {
  IMiddleware,
  IRequestExecutionContext,
} from "@workspace/lib/server";

import { getUserRolesAndPermission } from "@/lib/getUserPermission";

import { CONTAINER_TYPES } from "@/container/container-types";

/**
 * Resolves the better-auth session for the incoming request and attaches it to
 * `request.userAuth`. Does not block unauthenticated requests.
 *
 * Apply to a controller or route with `@UseMiddleware(AuthMiddleware)`.
 */
@injectable()
export class AuthMiddleware implements IMiddleware {
  constructor(@inject(CONTAINER_TYPES.Auth) private readonly auth: AuthType) {}

  public async execute({ request }: IRequestExecutionContext): Promise<void> {
    const session = await this.auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    request.userAuth = session ?? null;
  }
}

export class RolePermissionMiddleware implements IMiddleware {
  constructor(
    @inject(CONTAINER_TYPES.Drizzle) private readonly db: DatabaseType
  ) {}

  public async execute({ request }: IRequestExecutionContext): Promise<void> {
    if (request?.userAuth) {
      const { user } = request.userAuth;
      const { roles, permissions } = await getUserRolesAndPermission(
        user.id,
        this.db
      );
      request.userRoles = roles;
      request.userPermissions = permissions;
    }
  }
}
