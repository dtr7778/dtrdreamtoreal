import { useAuthStore } from "#/stores/zustand/auth/AuthStoreContext";

import type { PermissionStrType } from "@workspace/lib/types";
import { hasPermission } from "@workspace/lib/utils";

export function usePermissionCheck(permissions: Array<PermissionStrType>) {
  const userPermissions = useAuthStore((state) => state.permissions);
  const authUser = useAuthStore((state) => state.user);

  const isAllowd = hasPermission(userPermissions, permissions, {
    userId: authUser.id,
  });

  return isAllowd;
}
