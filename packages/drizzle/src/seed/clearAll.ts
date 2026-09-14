import { DatabaseType } from "../drizzle-client";
import * as schema from "../schemas";

export async function clearAll(db: DatabaseType) {
  console.log("🧹 Clearing existing data...");
  await db.transaction(async (tx) => {
    await tx.delete(schema.EmployeeAddressTable);
    await tx.delete(schema.EmployeeEmailThreadTable);
    await tx.delete(schema.EmployeeSocialTable);
    await tx.delete(schema.EmployeeTable);

    await tx.delete(schema.CompanyAddressTable);
    await tx.delete(schema.CompanyEmailThreadTable);
    await tx.delete(schema.CompanySocialTable);
    await tx.delete(schema.CompanyTable);

    await tx.delete(schema.ContactSubmissionReplyTable);
    await tx.delete(schema.ContactUserTable);
    await tx.delete(schema.ContactSubmissionTable);

    await tx.delete(schema.EmailAttachmentTable);
    await tx.delete(schema.EmailRecipientTable);
    await tx.delete(schema.EmailTable);
    await tx.delete(schema.EmailThreadTable);

    await tx.delete(schema.AddressTable);

    await tx.delete(schema.SocialMediaTable);

    await tx.delete(schema.TaskTable);

    await tx.delete(schema.PushSubscriptionTable);
    await tx.delete(schema.NotificationSettingsTable);
    await tx.delete(schema.NotificationTable);

    await tx.delete(schema.UserRoleTable);
    await tx.delete(schema.RolePermissionTable);
    await tx.delete(schema.PermissionTable);
    await tx.delete(schema.RoleTable);

    await tx.delete(schema.FileTable);

    await tx.delete(schema.VerificationTable);

    await tx.delete(schema.AccountTable);
    await tx.delete(schema.SessionTable);
    await tx.delete(schema.UserActivityTable);
    await tx.delete(schema.UserTable);
  });
  console.log("🗑️  Cleared existing data \n");
}
