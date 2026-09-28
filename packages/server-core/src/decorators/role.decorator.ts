import type { RoleEnumType } from "@workspace/drizzle/zod-db-enums";

import { createMetadataDecorator } from "../framework";

export const REQUIRE_ROLES_METADATA_KEY = "backend:require:roles";

/**
 * Declares the roles required to access a controller or route.
 *
 * Combine with `@UseGuards(PermissionGuard)`. Access is granted when the
 * request holds at least one of the declared permissions or roles.
 */
export const RequireRoles = createMetadataDecorator<RoleEnumType>(
  REQUIRE_ROLES_METADATA_KEY
);
