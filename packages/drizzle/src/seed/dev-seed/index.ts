import { clearAll } from "../clearAll";
import { seedPermission } from "../permission.seed";
import { seedRolePermission } from "../rolePermission.seed";
import { seedRoles } from "../roles.seed";
import { seedDbClient } from "../seed-db.client";
import { seedChat } from "./chat.seed";
import { seedCompanies } from "./company.seed";
import { seedContacts } from "./contact.seed";
import { seedEmployees } from "./employee.seed";
import { seedNotifications } from "./notification.seed";
import { seedTasks } from "./task.seed";
import { seedUsers } from "./user.seed";

async function main() {
  console.log("🌱 Starting database seed...\n");

  const { db, dispose } = await seedDbClient();

  try {
    await clearAll(db);

    const roles = await seedRoles(db);
    const permissions = await seedPermission(db);
    const rolesAndPermissions = await seedRolePermission(
      db,
      roles,
      permissions
    );

    const users = await seedUsers(db, roles);

    const companies = await seedCompanies(db, users);

    const employees = await seedEmployees(db, companies, users);

    const contacts = await seedContacts(db);

    const notifications = await seedNotifications(db, users);
    const tasks = await seedTasks(db, users);

    const chatRooms = await seedChat(db, users);

    console.log("\n📊 Seed Summary:");

    console.log(`Roles: ${roles.length}`);
    console.log(`Permissions: ${permissions.length}`);
    console.log(`Roles and Permissions: ${rolesAndPermissions.length}`);
    console.log(`Users: ${users.length}`);
    console.log(`Companies: ${companies.length}`);
    console.log(`Employees: ${employees.length}`);
    console.log(`Contacts: ${contacts.length}`);
    console.log(`Notifications: ${notifications.length}`);
    console.log(`Tasks: ${tasks.length}`);
    console.log(`Chat Rooms: ${chatRooms.length}`);

    console.log("\n🎉 Seed completed successfully!");
  } finally {
    await dispose();
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  });
