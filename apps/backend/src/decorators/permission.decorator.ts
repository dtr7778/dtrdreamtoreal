import type { RoleEnumType } from "@workspace/drizzle/zod-db-enums";
import { createMetadataDecorator } from "@workspace/lib/server";
import type { PermissionStrType } from "@workspace/lib/types";

export const REQUIRE_PERMISSIONS_METADATA_KEY = "backend:require:permissions";
export const REQUIRE_ROLES_METADATA_KEY = "backend:require:roles";

/**
 * Declares the permissions required to access a controller or route.
 *
 * Combine with `@UseGuards(PermissionGuard)`. Access is granted when the
 * request holds at least one of the declared permissions or roles.
 */
export const RequirePermissions = createMetadataDecorator<PermissionStrType>(
  REQUIRE_PERMISSIONS_METADATA_KEY
);

/**
 * Declares the roles required to access a controller or route.
 *
 * Combine with `@UseGuards(PermissionGuard)`. Access is granted when the
 * request holds at least one of the declared permissions or roles.
 */
export const RequireRoles = createMetadataDecorator<RoleEnumType>(
  REQUIRE_ROLES_METADATA_KEY
);