import type { PermissionType, RoleType } from "@/types";

export function mockRole(newItems: Array<RoleType> = []): RoleType[] {
  return [
    {
      roleName: "USER",
    },
    ...newItems,
  ];
}

export function mockPermission(
  newItems: Array<PermissionType> = []
): PermissionType[] {
  return [
    {
      name: "system.user.manage",
      level: "system",
      resource: "user",
      action: "manage",
    },
    ...newItems,
  ];
}
