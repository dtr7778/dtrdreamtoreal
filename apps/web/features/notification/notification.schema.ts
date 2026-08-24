import z from "zod";

import { NotificationCategoryEnumSchema } from "@workspace/drizzle/zod-db-enums";

export const notificationUpdateSchema = z.object({
  category: NotificationCategoryEnumSchema,
  emailEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  inAppEnabled: z.boolean(),
});
export type NotificationUpdateType = z.infer<typeof notificationUpdateSchema>;
