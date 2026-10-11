import type { DatabaseType } from "../clients/drizzle-client";
import type {
  PermissionDataModel,
  RoleDataModel,
  RolePermissionDataModel,
} from "../schemas";
import { RolePermissionTable } from "../schemas";
import type { RoleEnumType } from "../schemas/enums/zod-db-enums";
import type { PermissionType } from "./permission.seed";
import { insertChunkedReturning } from "./seed-utils";

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

      // Lead Company permissions
      "system.lead_company.read",
      "system.lead_company.list",

      // Lead Employee permissions
      "system.lead_company_employee.read",
      "system.lead_company_employee.list",

      // Site audit permissions
      "system.site_audit.read",
      "system.site_audit.list",
    ],
  },
  {
    roleName: "ADMIN",
    permissions: [
      // Self permissions
      "self.user.read",
      "self.user.update",

      "system.role_permission.list",
      "system.role_permission.read",

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

      // Lead Company permissions
      "system.lead_company.read",
      "system.lead_company.list",
      "system.lead_company.create",
      "system.lead_company.update",
      "system.lead_company.delete",

      // Lead Employee permissions
      "system.lead_company_employee.read",
      "system.lead_company_employee.list",
      "system.lead_company_employee.create",
      "system.lead_company_employee.update",
      "system.lead_company_employee.delete",

      // Site audit permissions
      "system.site_audit.read",
      "system.site_audit.list",
      "system.site_audit.create",
      "system.site_audit.update",
      "system.site_audit.delete",
    ],
  },
  {
    roleName: "SUPER_ADMIN",
    permissions: [
      "self.user.read",
      "self.user.update",

      "system.role_permission.list",
      "system.role_permission.read",

      "system.user.manage",
      "system.task.manage",

      // Contact permissions
      "system.contact.manage",
      "system.contact.export",

      // Lead Company permissions
      "system.lead_company.manage",
      "system.lead_company.export",

      // Lead Employee permissions
      "system.lead_company_employee.manage",
      "system.lead_company_employee.export",

      // Site audit permissions
      "system.site_audit.manage",
    ],
  },
];

export async function seedRolePermission(
  db: DatabaseType,
  roles: Array<RoleDataModel>,
  permissions: Array<PermissionDataModel>
): Promise<Array<RolePermissionDataModel>> {
  console.log("🌱 Seeding role permissions...");

  const rolePermissionRows = rolesAndPermissionData.flatMap((r) => {
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
  });

  const rolesAndPermissions = await insertChunkedReturning(
    rolePermissionRows,
    (chunk) => db.insert(RolePermissionTable).values(chunk).returning()
  );

  console.log(`✅ ${rolesAndPermissions.length} Role permissions seeded`);
  return rolesAndPermissions;
}
