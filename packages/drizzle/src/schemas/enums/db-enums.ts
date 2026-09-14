import { pgEnum } from "drizzle-orm/pg-core";

import {
  ADDRESS_TYPE,
  CONTACT_STATUS,
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
  TASK_STATUS,
} from "./enum-values";

export const RoleEnum = pgEnum("RoleEnum", ROLES);

export const EmailDirectionEnum = pgEnum("EmailDirectionEnum", EMAIL_DIRECTION);

export const EmailStatusEnum = pgEnum("EmailStatusEnum", EMAIL_STATUS);

export const EmailEventTypeEnum = pgEnum(
  "EmailEventTypeEnum",
  EMAIL_EVENT_TYPE
);

export const EmailRecipientTypeEnum = pgEnum(
  "EmailRecipientTypeEnum",
  EMAIL_RECIPIENT_TYPE
);

export const ContactStatusEnum = pgEnum("ContactStatusEnum", CONTACT_STATUS);

export const NotificationCategoryEnum = pgEnum(
  "NotificationCategoryEnum",
  NOTIFICATION_CATEGORY
);
export const NotificationLevelEnum = pgEnum(
  "NotificationLevelEnum",
  NOTIFICATION_LEVEL
);

export const TaskStatusEnum = pgEnum("TaskStatusEnum", TASK_STATUS);

export const TaskPriorityEnum = pgEnum("TaskPriorityEnum", TASK_PRIORITY);

export const AddressTypeEnum = pgEnum("AddressTypeEnum", ADDRESS_TYPE);

export const SocialMediaPlatfromTypeEnum = pgEnum(
  "SocialMediaPlatfromTypeEnum",
  SOCIAL_MEDIA_PLATFROM_TYPE
);

export const SocialMediaTypeEnum = pgEnum(
  "SocialMediaTypeEnum",
  SOCIAL_MEDIA_TYPE
);
