import { clearAll } from "../clearAll";
import { seedPermission } from "../permission.seed";
import { seedRolePermission } from "../rolePermission.seed";
import { seedRoles } from "../roles.seed";
import { db } from "../seed-db-client";
import { seedAccounts } from "./account.seed";
import { seedFile } from "./file.seed";
import { seedUsers } from "./user.seed";

async function main() {
  console.log("🌱 Starting database seed...\n");
  await clearAll(db);

  // Seed data
  const roles = await seedRoles();
  const permissions = await seedPermission();

  const users = await seedUsers(roles);
  const accounts = await seedAccounts(users);

  const files = await seedFile();

  const rolesAndPermissions = await seedRolePermission(roles, permissions);

  console.log("\n📊 Seed Summary:");

  console.log(`Roles and Permissions: ${rolesAndPermissions.length}`);
  console.log(`Users: ${users.length}`);
  console.log(`Accounts: ${accounts.length}`);
  console.log(`Files: ${files.length}`);

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
