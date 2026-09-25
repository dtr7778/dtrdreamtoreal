import { injectable } from "inversify";

import type { RoleEnumType } from "@workspace/drizzle/zod-db-enums";
import {
  getAllAndMergeMetadata,
  type IGuard,
  type IRequestExecutionContext,
} from "@workspace/lib/server";
import type { PermissionStrType } from "@workspace/lib/types";
import { hasPermission } from "@workspace/lib/utils";

import {
  REQUIRE_PERMISSIONS_METADATA_KEY,
  REQUIRE_ROLES_METADATA_KEY,
} from "@/decorators/permission.decorator";

/**
 * Enforces the permissions declared with `@RequirePermissions` on a controller or route.
 *
 * Resolution:
 * - no requirement declared → allow;
 * - otherwise allow when the request holds at least one required role OR
 *   satisfies at least one required permission.
 *
 * Apply with `@RequirePermissions(...)` and
 * `@UseGuards(PermissionGuard)` after `@UseMiddleware(AuthMiddleware)`.
 */
@injectable()
export class PermissionGuard implements IGuard {
  public canActivate({
    request,
    controllerClass,
    handlerMethodName,
  }: IRequestExecutionContext): boolean {
    const targets = [
      { target: controllerClass },
      { target: controllerClass, propertyKey: handlerMethodName },
    ];

    const permissions = getAllAndMergeMetadata<PermissionStrType>(
      REQUIRE_PERMISSIONS_METADATA_KEY,
      targets
    );

    if (permissions.length === 0) {
      return true;
    }

    return hasPermission(request.userPermissions ?? [], permissions, {
      userId: request.userAuth?.user?.id,
    });
  }
}

/**
 * Enforces the roles declared with `@RequireRoles` on a controller or route.
 *
 * Resolution:
 * - no requirement declared → allow;
 * - otherwise allow when the request holds at least one required role OR
 *   satisfies at least one required permission.
 *
 * Apply with `@RequireRoles(...)` and
 * `@UseGuards(RoleGuard)` after `@UseMiddleware(AuthMiddleware)`.
 */
@injectable()
export class RoleGuard implements IGuard {
  public canActivate({
    request,
    controllerClass,
    handlerMethodName,
  }: IRequestExecutionContext): boolean {
    const targets = [
      { target: controllerClass },
      { target: controllerClass, propertyKey: handlerMethodName },
    ];

    const roles = getAllAndMergeMetadata<RoleEnumType>(
      REQUIRE_ROLES_METADATA_KEY,
      targets
    );

    if (roles.length === 0) {
      return true;
    }

    const userRoles = request.userRoles ?? [];

    return roles.some((role) =>
      userRoles.some((userRole) => userRole.roleName === role)
    );
  }
}
