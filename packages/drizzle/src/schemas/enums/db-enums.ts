import { pgEnum } from "drizzle-orm/pg-core";

import {
  CONTACT_SUBMISSION_STATUS,
  FEEDBACK_ISSUE_STATUS,
  FEEDBACK_ISSUE_TYPE,
  NOTIFICATION_CATEGORY,
  NOTIFICATION_LEVEL,
  ROLES,
  TASK_PRIORITY,
  TASK_STATUS,
} from "./enum-values";

export const RoleEnum = pgEnum("RoleEnum", ROLES);

export const ContactSubmissionStatusEnum = pgEnum(
  "ContactSubmissionStatusEnum",
  CONTACT_SUBMISSION_STATUS
);

export const FeedbackIssueTypeEnum = pgEnum(
  "FeedbackIssueTypeEnum",
  FEEDBACK_ISSUE_TYPE
);
export const FeedbackIssueStatusEnum = pgEnum(
  "FeedbackIssueStatusEnum",
  FEEDBACK_ISSUE_STATUS
);

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
