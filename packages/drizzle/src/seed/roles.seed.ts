import { InsertRole, RoleDataModel, RoleTable } from "../schemas";
import { RoleEnumSchema } from "../schemas/enums/zod-db-enums";
import { db } from "./seed-db-client";

export const SYSTEM_ROLES = [
  RoleEnumSchema.enum.USER,
  RoleEnumSchema.enum.SUPPORT_AGENT,
  RoleEnumSchema.enum.ADMIN,
  RoleEnumSchema.enum.SUPER_ADMIN,
] as readonly string[];

export const rolesData: Array<InsertRole> = [
  {
    roleName: RoleEnumSchema.enum.USER,
    description: "Regular user with basic self-management permissions",
  },
  {
    roleName: RoleEnumSchema.enum.SUPPORT_AGENT,
    description: "Support agent",
  },
  {
    roleName: RoleEnumSchema.enum.ADMIN,
    description: "Admin",
  },
  {
    roleName: RoleEnumSchema.enum.SUPER_ADMIN,
    description: "Super admin",
  },
];

export async function seedRoles(): Promise<Array<RoleDataModel>> {
  console.log("🌱 Seeding roles...");

  const roles = await db.insert(RoleTable).values(rolesData).returning();

  console.log(`✅ ${roles.length} Roles seeded`);
  return roles;
}
