import { clearAll } from "../clearAll";
import { seedPermission } from "../permission.seed";
import { seedRolePermission } from "../rolePermission.seed";
import { seedRoles } from "../roles.seed";
import { db } from "../seed-db-client";
import { seedContacts } from "./contact.seed";
import { seedNotifications } from "./notification.seed";
import { seedTasks } from "./task.seed";
import { seedUsers } from "./user.seed";

async function main() {
  console.log("🌱 Starting database seed...\n");
  await clearAll(db);

  // Seed data
  const roles = await seedRoles();
  const permissions = await seedPermission();
  const rolesAndPermissions = await seedRolePermission(roles, permissions);

  const users = await seedUsers(roles);

  const contacts = await seedContacts(users);
  const notifications = await seedNotifications(users);
  const tasks = await seedTasks(users);

  console.log("\n📊 Seed Summary:");

  console.log(`Roles: ${roles.length}`);
  console.log(`Permissions: ${permissions.length}`);
  console.log(`Roles and Permissions: ${rolesAndPermissions.length}`);
  console.log(`Users: ${users.length}`);
  console.log(`Contacts: ${contacts.length}`);
  console.log(`Notifications: ${notifications.length}`);
  console.log(`Tasks: ${tasks.length}`);

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
