import type { DatabaseType } from "../clients/drizzle-client";
import * as schema from "../schemas";

export async function clearAll(db: DatabaseType) {
  console.log("🧹 Clearing existing data...");

  await db.delete(schema.ContactSubmissionReplyTable);
  await db.delete(schema.EmailAttachmentTable);
  await db.delete(schema.EmailRecipientTable);
  await db.delete(schema.ContactSubmissionTable);
  await db.delete(schema.EmailTable);
  await db.delete(schema.EmailThreadTable);
  await db.delete(schema.ContactUserTable);

  await db.delete(schema.LeadCompanyAddressTable);
  await db.delete(schema.LeadCompanyEmailThreadTable);
  await db.delete(schema.LeadCompanySocialTable);
  await db.delete(schema.LeadCompanyAiUsageTable);
  await db.delete(schema.LeadUserAddressTable);
  await db.delete(schema.LeadUserEmailThreadTable);
  await db.delete(schema.LeadUserSocialTable);

  await db.delete(schema.AuditItemTable);
  await db.delete(schema.AuditLogTable);
  await db.delete(schema.CwvSnapshotTable);
  await db.delete(schema.SiteAuditTable);

  await db.delete(schema.NotificationSettingsTable);
  await db.delete(schema.PushSubscriptionTable);
  await db.delete(schema.NotificationTable);

  await db.delete(schema.UserRoleTable);
  await db.delete(schema.RolePermissionTable);
  await db.delete(schema.PermissionTable);
  await db.delete(schema.RoleTable);

  await db.delete(schema.PersonalTaskTable);
  await db.delete(schema.CompanyTaskTable);
  await db.delete(schema.ChatMessageAttachmentTable);
  await db.delete(schema.ChatMessageReactionTable);
  await db.delete(schema.ChatMessageTable);
  await db.delete(schema.ChatRoomMemberTable);
  await db.delete(schema.ChatRoomTable);
  await db.delete(schema.FileTable);

  await db.delete(schema.UserEventTable);
  await db.delete(schema.UserSessionTable);
  await db.delete(schema.UserDeviceTable);
  await db.delete(schema.AccountTable);
  await db.delete(schema.SessionTable);
  await db.delete(schema.VerificationTable);

  await db.delete(schema.LeadUserTable);
  await db.delete(schema.LeadCompanyTable);
  await db.delete(schema.AddressTable);
  await db.delete(schema.SocialMediaTable);
  await db.delete(schema.AiUsageTable);
  await db.delete(schema.UserTable);

  console.log("🗑️  Cleared existing data \n");
}
