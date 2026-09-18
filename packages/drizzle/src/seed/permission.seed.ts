import { PermissionDataModel, PermissionTable } from "../schemas";
import {
  ActionTypeEnumType,
  PermissionLevelEnumType,
  ResourceTypeEnumType,
} from "../schemas/enums/zod-db-enums";
import { db } from "./seed-db-client";

export const separator = ".";

export type PermissionType =
  `${PermissionLevelEnumType}${typeof separator}${ResourceTypeEnumType}${typeof separator}${ActionTypeEnumType}`;

type CreatePermissionType = {
  level: PermissionLevelEnumType;
  resource: ResourceTypeEnumType;
  action: ActionTypeEnumType;
  description?: string | null | undefined;
};

const selfPermissions: CreatePermissionType[] = [
  // User
  {
    level: "self",
    resource: "user",
    action: "read",
    description: "View own profile information",
  },
  {
    level: "self",
    resource: "user",
    action: "update",
    description: "Edit own profile details",
  },

  // Lead
  {
    level: "self",
    resource: "lead",
    action: "create",
    description: "Create new leads for own assignments",
  },
  {
    level: "self",
    resource: "lead",
    action: "read",
    description: "View details of own leads",
  },
  {
    level: "self",
    resource: "lead",
    action: "list",
    description: "List all own leads with filters",
  },
  {
    level: "self",
    resource: "lead",
    action: "update",
    description: "Update information on own leads",
  },
  {
    level: "self",
    resource: "lead",
    action: "delete",
    description: "Remove own leads permanently",
  },

  // Lead Mail
  {
    level: "self",
    resource: "lead_mail",
    action: "create",
    description: "Send new emails to own leads",
  },
  {
    level: "self",
    resource: "lead_mail",
    action: "read",
    description: "View email content of own lead mails",
  },
  {
    level: "self",
    resource: "lead_mail",
    action: "list",
    description: "List all emails for own leads",
  },

  // Task
  {
    level: "self",
    resource: "task",
    action: "create",
    description: "Create new tasks for own assignments",
  },
  {
    level: "self",
    resource: "task",
    action: "read",
    description: "View details of own tasks",
  },
  {
    level: "self",
    resource: "task",
    action: "list",
    description: "List all own tasks with filters",
  },
  {
    level: "self",
    resource: "task",
    action: "update",
    description: "Update information on own tasks",
  },
  {
    level: "self",
    resource: "task",
    action: "delete",
    description: "Remove own tasks permanently",
  },
];

const systemPermissions: CreatePermissionType[] = [
  // User
  {
    level: "system",
    resource: "user",
    action: "create",
    description: "Create new user accounts",
  },
  {
    level: "system",
    resource: "user",
    action: "read",
    description: 'View any user"s profile information',
  },
  {
    level: "system",
    resource: "user",
    action: "list",
    description: "List all users with filters and pagination",
  },
  {
    level: "system",
    resource: "user",
    action: "update",
    description: 'Edit any user"s profile details',
  },
  {
    level: "system",
    resource: "user",
    action: "delete",
    description: "Deactivate or remove any user account",
  },
  {
    level: "system",
    resource: "user",
    action: "manage",
    description: "Full user administration including role assignments",
  },

  // Role Permission
  {
    level: "system",
    resource: "role-permission",
    action: "create",
    description: "Create new roles and permissions",
  },
  {
    level: "system",
    resource: "role-permission",
    action: "read",
    description: "View role and permission configurations",
  },
  {
    level: "system",
    resource: "role-permission",
    action: "list",
    description: "List all roles and their assigned permissions",
  },
  {
    level: "system",
    resource: "role-permission",
    action: "update",
    description: "Modify role details and permission assignments",
  },
  {
    level: "system",
    resource: "role-permission",
    action: "delete",
    description: "Remove roles from the system",
  },
  {
    level: "system",
    resource: "role-permission",
    action: "manage",
    description: "Full access to configure roles and permissions",
  },

  // Invitation
  {
    level: "system",
    resource: "invitation",
    action: "create",
    description: "Send new user invitations via email",
  },
  {
    level: "system",
    resource: "invitation",
    action: "read",
    description: "View invitation details and status",
  },
  {
    level: "system",
    resource: "invitation",
    action: "list",
    description: "List all invitations with filters",
  },
  {
    level: "system",
    resource: "invitation",
    action: "update",
    description: "Resend or modify pending invitations",
  },
  {
    level: "system",
    resource: "invitation",
    action: "delete",
    description: "Revoke or cancel pending invitations",
  },
  {
    level: "system",
    resource: "invitation",
    action: "manage",
    description: "Full invitation management including bulk operations",
  },

  // Lead
  {
    level: "system",
    resource: "lead",
    action: "create",
    description: "Create new leads in the system",
  },
  {
    level: "system",
    resource: "lead",
    action: "read",
    description: 'View any lead"s details regardless of assignment',
  },
  {
    level: "system",
    resource: "lead",
    action: "list",
    description: "List all leads",
  },
  {
    level: "system",
    resource: "lead",
    action: "update",
    description: 'Edit any lead"s information and assignments',
  },
  {
    level: "system",
    resource: "lead",
    action: "delete",
    description: "Remove leads from the system permanently",
  },
  {
    level: "system",
    resource: "lead",
    action: "manage",
    description: "Full lead administration including reassignment",
  },
  {
    level: "system",
    resource: "lead",
    action: "export",
    description: "Export lead data to CSV or other formats",
  },

  // Lead Mail
  {
    level: "system",
    resource: "lead_mail",
    action: "create",
    description: "Send emails to any lead in the system",
  },
  {
    level: "system",
    resource: "lead_mail",
    action: "read",
    description: "View email content for any lead",
  },
  {
    level: "system",
    resource: "lead_mail",
    action: "list",
    description: "List all lead emails",
  },
  {
    level: "system",
    resource: "lead_mail",
    action: "update",
    description: "Edit email records for any lead",
  },
  {
    level: "system",
    resource: "lead_mail",
    action: "delete",
    description: "Remove email records from the system",
  },
  {
    level: "system",
    resource: "lead_mail",
    action: "manage",
    description: "Full email management for all leads",
  },
  {
    level: "system",
    resource: "lead_mail",
    action: "export",
    description: "Export lead email data to CSV or other formats",
  },

  // Task
  {
    level: "system",
    resource: "task",
    action: "create",
    description: "Create new tasks in the system",
  },
  {
    level: "system",
    resource: "task",
    action: "read",
    description: 'View any task"s details regardless of assignment',
  },
  {
    level: "system",
    resource: "task",
    action: "list",
    description: "List all tasks",
  },
  {
    level: "system",
    resource: "task",
    action: "update",
    description: 'Edit any task"s information and assignments',
  },
  {
    level: "system",
    resource: "task",
    action: "delete",
    description: "Remove tasks from the system permanently",
  },
  {
    level: "system",
    resource: "task",
    action: "manage",
    description: "Full task administration including reassignment",
  },
  {
    level: "system",
    resource: "task",
    action: "export",
    description: "Export task data to CSV or other formats",
  },

  // Contact
  {
    level: "system",
    resource: "contact",
    action: "create",
    description: "Create new contacts in the system",
  },
  {
    level: "system",
    resource: "contact",
    action: "read",
    description: 'View any contact"s details regardless of assignment',
  },
  {
    level: "system",
    resource: "contact",
    action: "list",
    description: "List all contacts",
  },
  {
    level: "system",
    resource: "contact",
    action: "update",
    description: 'Edit any contact"s information and assignments',
  },
  {
    level: "system",
    resource: "contact",
    action: "delete",
    description: "Remove contacts from the system permanently",
  },
  {
    level: "system",
    resource: "contact",
    action: "manage",
    description: "Full contact administration including reassignment",
  },
  {
    level: "system",
    resource: "contact",
    action: "export",
    description: "Export contact data to CSV or other formats",
  },

  // Company
  {
    level: "system",
    resource: "company",
    action: "create",
    description: "Create new companies in the system",
  },
  {
    level: "system",
    resource: "company",
    action: "read",
    description: 'View any company"s details',
  },
  {
    level: "system",
    resource: "company",
    action: "list",
    description: "List all companies with filters and pagination",
  },
  {
    level: "system",
    resource: "company",
    action: "update",
    description: 'Edit any company"s information',
  },
  {
    level: "system",
    resource: "company",
    action: "delete",
    description: "Remove companies from the system permanently",
  },
  {
    level: "system",
    resource: "company",
    action: "manage",
    description: "Full company administration",
  },
  {
    level: "system",
    resource: "company",
    action: "export",
    description: "Export company data to CSV or other formats",
  },

  // Employee
  {
    level: "system",
    resource: "company_employee",
    action: "create",
    description: "Create new employees in the system",
  },
  {
    level: "system",
    resource: "company_employee",
    action: "read",
    description: 'View any employee"s details',
  },
  {
    level: "system",
    resource: "company_employee",
    action: "list",
    description: "List all employees with filters and pagination",
  },
  {
    level: "system",
    resource: "company_employee",
    action: "update",
    description: 'Edit any employee"s information',
  },
  {
    level: "system",
    resource: "company_employee",
    action: "delete",
    description: "Remove employees from the system permanently",
  },
  {
    level: "system",
    resource: "company_employee",
    action: "manage",
    description: "Full employee administration",
  },
  {
    level: "system",
    resource: "company_employee",
    action: "export",
    description: "Export employee data to CSV or other formats",
  },
];

export const permissionsData: CreatePermissionType[] = [
  ...selfPermissions,
  ...systemPermissions,
];

export async function seedPermission(): Promise<Array<PermissionDataModel>> {
  console.log("🌱 Seeding permissions...");

  const permissions = await db
    .insert(PermissionTable)
    .values(
      permissionsData.map((p) => ({
        ...p,
        name: `${p.level}${separator}${p.resource}${separator}${p.action}` as PermissionType,
        level: p.level as PermissionLevelEnumType,
        resource: p.resource as ResourceTypeEnumType,
        action: p.action as ActionTypeEnumType,
      }))
    )
    .returning();

  console.log(`✅ ${permissions.length} Permissions seeded`);
  return permissions;
}
