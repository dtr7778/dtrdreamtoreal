import { injectable } from "inversify";

import { RoleEnumType } from "@workspace/drizzle/zod-db-enums";

import { REQUIRE_ROLES_METADATA_KEY } from "../decorators";
import {
  getAllAndMergeMetadata,
  IGuard,
  IRequestExecutionContext,
} from "../framework";

/**
 * Enforces the roles declared with `@RequireRoles` on a controller or route.
 *
 * Resolution:
 * - no requirement declared → allow;
 * - otherwise the request must satisfy the class-level roles AND the
 *   method-level roles; within one level any listed role is enough.
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
    const userRoles = request.userRoles ?? [];

    const classRoles = getAllAndMergeMetadata<RoleEnumType>(
      REQUIRE_ROLES_METADATA_KEY,
      [{ target: controllerClass }]
    );
    const methodRoles = getAllAndMergeMetadata<RoleEnumType>(
      REQUIRE_ROLES_METADATA_KEY,
      [{ target: controllerClass, propertyKey: handlerMethodName }]
    );

    const isAllowed = (roles: RoleEnumType[]): boolean =>
      roles.length === 0 ||
      roles.some((role) =>
        userRoles.some((userRole) => userRole.roleName === role)
      );

    return isAllowed(classRoles) && isAllowed(methodRoles);
  }
}
