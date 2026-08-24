import z from "zod";

import {
  selectNotificationSchema,
  selectNotificationSettingsSchema,
} from "@workspace/drizzle/schemas";
import {
  NotificationCategoryEnumSchema,
  NotificationLevelEnumSchema,
} from "@workspace/drizzle/zod-db-enums";
import {
  apiOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/utils";

import { baseContract } from "@/server/orpc.contract-base";
import { InferContractRouterType } from "@/types/orpc.types";

import { notificationUpdateSchema } from "../notification.schema";

const tags = ["Notification"] as const;

const listNotificationContract = baseContract
  .route({
    path: "/notifications/list",
    description: "Get all user notifications",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectNotificationSchema>({
      searchFields: ["title"],
      orderFields: ["createdAt"],
      filter: z.object({
        level: NotificationLevelEnumSchema.optional(),
        category: NotificationCategoryEnumSchema.optional(),
        isRead: z.boolean().optional(),
      }),
    })
  )
  .output(
    apiOutputZodSchema(paginateOutputZodSchema(selectNotificationSchema))
  );
export type ListNotificationContractType = InferContractRouterType<
  typeof listNotificationContract
>;

const settingsDetailsContract = baseContract
  .route({
    method: "GET",
    path: "/notifications/settings",
    description: "Get user notification settings",
    tags,
  })
  .output(
    apiOutputZodSchema(
      z.array(
        selectNotificationSettingsSchema.pick({
          category: true,
          emailEnabled: true,
          pushEnabled: true,
          inAppEnabled: true,
        })
      )
    )
  );
export type SettingsDetailsContractType = InferContractRouterType<
  typeof settingsDetailsContract
>;

const updateSettingsContract = baseContract
  .route({
    path: "/notifications/settings/update",
    description: "Update a specific notification channel setting",
    tags,
  })
  .input(notificationUpdateSchema)
  .output(apiOutputZodSchema(z.null()));
export type UpdateSettingsContractType = InferContractRouterType<
  typeof updateSettingsContract
>;

const markAsReadContract = baseContract
  .route({
    path: "/notifications/mark-as-read",
    description: "Mark a notification as read",
    tags,
  })
  .input(z.object({ ids: z.array(z.uuid()) }))
  .output(apiOutputZodSchema(z.null()));
export type MarkAsReadContractType = InferContractRouterType<
  typeof markAsReadContract
>;

const subscribePushNotificationContract = baseContract
  .route({
    path: "/notifications/push-subscription/subscribe",
    description: "Subscribe to push notifications",
    tags,
  })
  .input(
    z.object({
      endpoint: z.url(),
      p256dh: z.string(),
      auth: z.string(),
      expirationTime: z.number().nullable().optional(),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type SubscribePushNotificationContractType = InferContractRouterType<
  typeof subscribePushNotificationContract
>;

const unsubscribePushNotificationContract = baseContract
  .route({
    path: "/notifications/push-subscription/unsubscribe",
    description: "Unsubscribe from push notifications",
    tags,
  })
  .output(apiOutputZodSchema(z.null()));
export type UnsubscribePushNotificationContractType = InferContractRouterType<
  typeof unsubscribePushNotificationContract
>;

export const notificationContract = {
  list: listNotificationContract,
  settings: settingsDetailsContract,
  updateSettings: updateSettingsContract,
  markAsRead: markAsReadContract,
  subscribe: subscribePushNotificationContract,
  unsubscribe: unsubscribePushNotificationContract,
};
