import type { PermissionStrType } from "@workspace/lib/types";

import { createMetadataDecorator } from "../framework";

export const REQUIRE_PERMISSIONS_METADATA_KEY = "backend:require:permissions";

/**
 * Declares the permissions required to access a controller or route.
 *
 * Combine with `@UseGuards(PermissionGuard)`. Access is granted when the
 * request holds at least one of the declared permissions or roles.
 */
export const RequirePermissions = createMetadataDecorator<PermissionStrType>(
  REQUIRE_PERMISSIONS_METADATA_KEY
);
