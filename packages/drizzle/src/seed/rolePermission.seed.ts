import {
  PermissionDataModel,
  RoleDataModel,
  RolePermissionDataModel,
  RolePermissionTable,
} from "../schemas";
import { RoleEnumType } from "../schemas/enums/zod-db-enums";
import { PermissionType } from "./permission.seed";
import { db } from "./seed-db-client";

export const rolesAndPermissionData: Array<{
  roleName: RoleEnumType;
  permissions: Array<PermissionType>;
}> = [
  // ==================== SYSTEM ROLES ====================
  {
    roleName: "USER",
    permissions: [
      // Can manage their own profile and create/join organizations
      "self.user.read",
      "self.user.update",
      "self.invitation.list",
      "self.invitation.update", // Accept/decline invites
    ],
  },
  {
    roleName: "SUPPORT_AGENT",
    permissions: [
      // Self permissions
      "self.user.read",
      "self.user.update",

      // Cross-org read-only user/org support
      "system.user.read",
      "system.user.list",
    ],
  },
  {
    roleName: "ADMIN",
    permissions: [
      // Self permissions
      "self.user.read",
      "self.user.update",

      // System user management
      "system.user.read",
      "system.user.list",
      "system.user.update",
      "system.user.delete",
    ],
  },
  {
    roleName: "SUPER_ADMIN",
    permissions: [
      "self.user.read",
      "self.user.update",

      // Full system control (manage bypasses specific actions)
      "system.user.manage",
    ],
  },
];

export async function seedRolePermission(
  roles: Array<RoleDataModel>,
  permissions: Array<PermissionDataModel>
): Promise<Array<RolePermissionDataModel>> {
  console.log("🌱 Seeding role permissions...");

  const rolesAndPermissions = await db
    .insert(RolePermissionTable)
    .values(
      rolesAndPermissionData.flatMap((r) => {
        const role = roles.find(({ roleName }) => roleName === r.roleName);

        if (!role) return [];

        const permissionsForRole = permissions
          .filter(({ name }) => r.permissions.includes(name as PermissionType))
          .map(({ id }) => ({
            roleId: role.id,
            permissionId: id,
          }));

        console.log(
          `📝 Assigning ${permissionsForRole.length} permissions to ${r.roleName}`
        );

        return permissionsForRole;
      })
    )
    .returning();

  console.log(`✅ ${rolesAndPermissions.length} Role permissions seeded`);
  return rolesAndPermissions;
}
