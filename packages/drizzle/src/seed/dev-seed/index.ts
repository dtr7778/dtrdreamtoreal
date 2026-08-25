import { clearAll } from "../clearAll";
import { seedPermission } from "../permission.seed";
import { seedRolePermission } from "../rolePermission.seed";
import { seedRoles } from "../roles.seed";
import { db } from "../seed-db-client";
import { seedUsers } from "./user.seed";

async function main() {
  console.log("🌱 Starting database seed...\n");
  await clearAll(db);

  // Seed data
  const roles = await seedRoles();
  const permissions = await seedPermission();

  const users = await seedUsers(roles);

  const rolesAndPermissions = await seedRolePermission(roles, permissions);

  console.log("\n📊 Seed Summary:");

  console.log(`Roles and Permissions: ${rolesAndPermissions.length}`);
  console.log(`Users: ${users.length}`);

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  });
