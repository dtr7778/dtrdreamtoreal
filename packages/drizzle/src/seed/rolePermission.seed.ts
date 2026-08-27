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
      "system.task.manage",
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
      "system.task.manage",

      // Contact permissions
      "system.contact.read",
      "system.contact.list",
    ],
  },
  {
    roleName: "ADMIN",
    permissions: [
      // Self permissions
      "self.user.read",
      "self.user.update",

      "system.role-permission.list",
      "system.role-permission.read",

      // System user management
      "system.user.read",
      "system.user.list",
      "system.user.update",
      "system.task.manage",

      // Contact permissions
      "system.contact.read",
      "system.contact.list",
      "system.contact.create",
      "system.contact.update",
      "system.contact.delete",
    ],
  },
  {
    roleName: "SUPER_ADMIN",
    permissions: [
      "self.user.read",
      "self.user.update",

      "system.role-permission.list",
      "system.role-permission.read",

      "system.user.manage",
      "system.task.manage",

      // Contact permissions
      "system.contact.manage",
      "system.contact.export",
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
