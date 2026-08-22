import { DatabaseType } from "../drizzle-client";
import * as schema from "../schemas";

export async function clearAll(db: DatabaseType) {
  console.log("🧹 Clearing existing data...");
  await db.transaction(async (tx) => {
    await tx.delete(schema.ContactSubmissionReplyTable);
    await tx.delete(schema.ContactSubmissionTable);

    await tx.delete(schema.FeedbackIssueReplyTable);
    await tx.delete(schema.FeedbackIssueTable);

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
