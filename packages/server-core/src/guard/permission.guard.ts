import { injectable } from "inversify";

import type { PermissionStrType } from "@workspace/lib/types";
import { hasPermission } from "@workspace/lib/utils";

import { REQUIRE_PERMISSIONS_METADATA_KEY } from "../decorators";
import {
  getAllAndMergeMetadata,
  IGuard,
  IRequestExecutionContext,
} from "../framework";

/**
 * Enforces the permissions declared with `@RequirePermissions` on a controller or route.
 *
 * Resolution:
 * - no requirement declared → allow;
 * - otherwise the request must satisfy the class-level permissions AND the
 *   method-level permissions; within one level any listed permission is enough.
 *
 * `self.*` permissions require a resolvable resource id (route `:id`/`:userId`
 * or body `id`); without one the request is denied.
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
    const classPermissions = getAllAndMergeMetadata<PermissionStrType>(
      REQUIRE_PERMISSIONS_METADATA_KEY,
      [{ target: controllerClass }]
    );
    const methodPermissions = getAllAndMergeMetadata<PermissionStrType>(
      REQUIRE_PERMISSIONS_METADATA_KEY,
      [{ target: controllerClass, propertyKey: handlerMethodName }]
    );

    const resourceId = resolveResourceId(request);

    // Class-level and method-level requirements are independent gates: a
    // request must satisfy both. Within a single level any listed permission
    // is sufficient (handled by `hasPermission`).
    return (
      this.isAllowed(request, classPermissions, resourceId) &&
      this.isAllowed(request, methodPermissions, resourceId)
    );
  }

  private isAllowed(
    request: IRequestExecutionContext["request"],
    permissions: PermissionStrType[],
    resourceId: string | undefined
  ): boolean {
    if (permissions.length === 0) return true;

    // A `self.*` requirement is only enforceable against a concrete resource
    // id. Without one the ownership cannot be verified, so fail closed.
    if (
      permissions.some((permission) => permission.startsWith("self.")) &&
      !resourceId
    ) {
      return false;
    }

    return hasPermission(request.userPermissions ?? [], permissions, {
      userId: request.userAuth?.user?.id,
      resourceId,
    });
  }
}

/** Best-effort resource id for `self.*` permission checks. */
function resolveResourceId(request: IRequestExecutionContext["request"]) {
  const params = request.params ?? {};
  const fromParams = params.id ?? params.resourceId ?? params.userId;
  if (typeof fromParams === "string" && fromParams.length > 0) {
    return fromParams;
  }

  const body = request.body as Record<string, unknown> | undefined;
  return typeof body?.id === "string" && body.id.length > 0
    ? body.id
    : undefined;
}
