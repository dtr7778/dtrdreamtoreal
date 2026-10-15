import { text } from "drizzle-orm/sqlite-core";

import {
  ADDRESS_TYPE,
  AUDIT_ITEM_STATUS,
  AUDIT_LOG_EVENT_TYPE,
  AUDIT_LOG_LEVEL,
  AUDIT_STATUS,
  CHAT_MEMBER_ROLE,
  CHAT_MESSAGE_TYPE,
  CHAT_ROOM_TYPE,
  CONTACT_STATUS,
  CWV_SOURCE,
  CWV_STRATEGY,
  EMAIL_DIRECTION,
  EMAIL_EVENT_TYPE,
  EMAIL_RECIPIENT_TYPE,
  EMAIL_STATUS,
  NOTIFICATION_CATEGORY,
  NOTIFICATION_LEVEL,
  ROLES,
  SOCIAL_MEDIA_PLATFROM_TYPE,
  SOCIAL_MEDIA_TYPE,
  TASK_PRIORITY,
  TASK_SOURCE,
  TASK_STATUS,
  USER_EVENT_TYPE,
} from "./enum-values";

export const RoleEnum = (name: string) => text(name, { enum: ROLES });

export const EmailDirectionEnum = (name: string) =>
  text(name, { enum: EMAIL_DIRECTION });

export const EmailStatusEnum = (name: string) =>
  text(name, { enum: EMAIL_STATUS });

export const EmailEventTypeEnum = (name: string) =>
  text(name, { enum: EMAIL_EVENT_TYPE });

export const EmailRecipientTypeEnum = (name: string) =>
  text(name, { enum: EMAIL_RECIPIENT_TYPE });

export const ContactStatusEnum = (name: string) =>
  text(name, { enum: CONTACT_STATUS });

export const NotificationCategoryEnum = (name: string) =>
  text(name, { enum: NOTIFICATION_CATEGORY });

export const NotificationLevelEnum = (name: string) =>
  text(name, { enum: NOTIFICATION_LEVEL });

export const TaskStatusEnum = (name: string) =>
  text(name, { enum: TASK_STATUS });

export const TaskPriorityEnum = (name: string) =>
  text(name, { enum: TASK_PRIORITY });

export const TaskSourceEnum = (name: string) =>
  text(name, { enum: TASK_SOURCE });

export const AddressTypeEnum = (name: string) =>
  text(name, { enum: ADDRESS_TYPE });

export const SocialMediaPlatfromTypeEnum = (name: string) =>
  text(name, { enum: SOCIAL_MEDIA_PLATFROM_TYPE });

export const SocialMediaTypeEnum = (name: string) =>
  text(name, { enum: SOCIAL_MEDIA_TYPE });

export const AuditStatusEnum = (name: string) =>
  text(name, { enum: AUDIT_STATUS });

export const AuditItemStatusEnum = (name: string) =>
  text(name, { enum: AUDIT_ITEM_STATUS });

export const CwvStrategyEnum = (name: string) =>
  text(name, { enum: CWV_STRATEGY });

export const CwvSourceEnum = (name: string) => text(name, { enum: CWV_SOURCE });

export const AuditLogLevelEnum = (name: string) =>
  text(name, { enum: AUDIT_LOG_LEVEL });

export const AuditLogEventTypeEnum = (name: string) =>
  text(name, { enum: AUDIT_LOG_EVENT_TYPE });

export const UserEventTypeEnum = (name: string) =>
  text(name, { enum: USER_EVENT_TYPE });

export const ChatRoomTypeEnum = (name: string) =>
  text(name, { enum: CHAT_ROOM_TYPE });

export const ChatMemberRoleEnum = (name: string) =>
  text(name, { enum: CHAT_MEMBER_ROLE });

export const ChatMessageTypeEnum = (name: string) =>
  text(name, { enum: CHAT_MESSAGE_TYPE });
