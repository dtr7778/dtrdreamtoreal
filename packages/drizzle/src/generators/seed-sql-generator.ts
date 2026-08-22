import fs from "node:fs/promises";
import path from "node:path";

import { permissionsData } from "../seed/permission.seed";
import { rolesAndPermissionData } from "../seed/rolePermission.seed";
import { rolesData } from "../seed/roles.seed";

function generatePermissionsSql() {
  const data = permissionsData.map(
    (p) =>
      `('${p.level}.${p.resource}.${p.action}', '${p.level}', '${p.resource}', '${p.action}', '${p.description}')`
  );
  const sql = `DELETE FROM public.permissions;\nINSERT INTO public.permissions (name, level, resource, action, description)\n\tVALUES\n\t\t${data.join(",\n\t\t")};`;
  return sql;
}

function generateRolesSql() {
  const data = rolesData.map((r) => `('${r.roleName}', '${r.description}')`);

  const sql = `DELETE FROM public.roles;\nINSERT INTO public.roles (role_name, description)\n\tVALUES\n\t\t${data.join(",\n\t\t")};`;
  return sql;
}

function generateRolePermissionSql() {
  const data = rolesAndPermissionData.flatMap(({ roleName, permissions }) =>
    permissions.map((permission) => {
      return `('${roleName}', '${permission}')`;
    })
  );
  const sql = `
  DELETE FROM public.role_permissions;\nWITH role_perm_mapping (role_name, permission_name) AS (\n\tVALUES\n\t\t${data.join(",\n\t\t")}\n )\n INSERT INTO public.role_permissions (role_id, permission_id)\n SELECT r.id, p.id\n FROM role_perm_mapping rpm\n JOIN public.roles r ON r.role_name = rpm.role_name::public."RoleEnum"\n JOIN public.permissions p ON p.name = rpm.permission_name;
  `;
  return sql;
}

async function main() {
  try {
    const permissionSql = generatePermissionsSql();
    const roleSql = generateRolesSql();
    const rolePermissionSql = generateRolePermissionSql();

    let sql = `SET search_path TO public;\n\n`;

    sql += `${permissionSql.trim()}\n\n`;
    sql += `${roleSql.trim()}\n\n`;
    sql += `${rolePermissionSql.trim()}`;

    const sqlFilePath = path.join(process.cwd(), "../../supabase/seed.sql");

    await fs.writeFile(sqlFilePath, sql, "utf-8");

    console.log(`✅ Seed SQL generated at ${sqlFilePath}`);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

main().catch(() => {
  process.exit(1);
});
