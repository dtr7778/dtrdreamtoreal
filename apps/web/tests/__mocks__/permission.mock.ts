import type { PermissionType, RoleType } from "@/types";

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

export function mockRole(newItems: Array<RoleType> = []): RoleType[] {
  return [
    {
      roleName: "USER",
    },
    ...newItems,
  ];
}

export function mockSystemRoles() {
  return [
    mockRole([
      { roleName: "USER" },
      { roleName: "ADMIN" },
      { roleName: "SUPER_ADMIN" },
    ]),
  ];
}

export function mockSystemPermissions() {
  return [
    mockPermission([
      {
        name: "system.user.manage",
        action: "manage",
        resource: "user",
        level: "system",
      },
      {
        name: "system.role-permission.manage",
        action: "manage",
        resource: "role-permission",
        level: "system",
      },
    ]),
  ];
}
