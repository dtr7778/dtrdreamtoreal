"use client";

import { hasPermission, PermissionStrType } from "@/lib/permission";

import { useAuthStore } from "@/stores/zustand/auth/AuthStoreContext";

export function usePermissionCheck(permissions: Array<PermissionStrType>) {
  const userPermissions = useAuthStore((state) => state.permissions);
  const authUser = useAuthStore((state) => state.user!);

  const isAllowd = hasPermission(userPermissions, permissions, {
    userId: authUser.id,
  });

  return isAllowd;
}
