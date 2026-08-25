import { implement } from "@orpc/server";
import { and, desc, eq, inArray } from "drizzle-orm";

import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  NotificationSettingsTable,
  NotificationTable,
  PushSubscriptionTable,
} from "@workspace/drizzle/schemas";
import { NotificationCategoryEnumSchema } from "@workspace/drizzle/zod-db-enums";
import { apiResponse } from "@workspace/lib/utils";

import { API_MESSAGES } from "@/constants/apiMessage";
import { authMiddleware } from "@/server/middleware/auth.middleware";
import { errorMiddleware } from "@/server/middleware/error.middleware";
import { privateRateLimitMiddleware } from "@/server/middleware/rateLimit.middleware";
import { ORPCContext } from "@/types/orpc.types";

import { notificationContract } from "./notification.contract";

export const notificationImpl = implement(notificationContract)
  .$context<ORPCContext>()
  .use(errorMiddleware)
  .use(privateRateLimitMiddleware)
  .use(authMiddleware);

export const listNotificationProcedure = notificationImpl.list.handler(
  async ({ context, input }) => {
    const { page, limit, offset, where } = buildPaginateOptions(
      {
        title: NotificationTable.title,
        level: NotificationTable.level,
        category: NotificationTable.category,
        isRead: NotificationTable.isRead,
        createdAt: NotificationTable.createdAt,
      },
      input
    );

    const joindedQuery = context.db
      .select({
        id: NotificationTable.id,
        category: NotificationTable.category,
        level: NotificationTable.level,
        title: NotificationTable.title,
        message: NotificationTable.message,
        data: NotificationTable.data,
        isRead: NotificationTable.isRead,
        readAt: NotificationTable.readAt,
        createdAt: NotificationTable.createdAt,
        updatedAt: NotificationTable.updatedAt,
      })
      .from(NotificationTable)
      .where(and(eq(NotificationTable.recipientId, context.user.id), where))
      .$dynamic();

    const [totalCount, notifications] = await Promise.all([
      context.db.$count(
        context.db
          .select({ id: NotificationTable.id })
          .from(NotificationTable)
          .where(eq(NotificationTable.recipientId, context.user.id))
      ),
      joindedQuery
        .orderBy(desc(NotificationTable.createdAt))
        .offset(offset)
        .limit(limit),
    ]);

    const meta = buildPaginationMeta(
      totalCount,
      notifications.length,
      page,
      limit
    );

    return apiResponse(API_MESSAGES.NOTIFICATION.GET_NOTIFICATIONS, {
      meta,
      data: notifications,
    });
  }
);

export const settingsDetailsProcedure = notificationImpl.settings.handler(
  async ({ context }) => {
    const userSettings = await context.db
      .select()
      .from(NotificationSettingsTable)
      .where(eq(NotificationSettingsTable.userId, context.user.id));

    const settings = NotificationCategoryEnumSchema.options.map((category) => {
      const existing = userSettings.find((s) => s.category === category);
      return {
        category,
        emailEnabled: existing?.emailEnabled ?? true,
        pushEnabled: existing?.pushEnabled ?? true,
        inAppEnabled: existing?.inAppEnabled ?? true,
      };
    });

    return apiResponse(API_MESSAGES.NOTIFICATION.GET_SETTINGS, settings);
  }
);

export const updateSettingsProcedure = notificationImpl.updateSettings.handler(
  async ({ context, input }) => {
    await context.db
      .insert(NotificationSettingsTable)
      .values({
        userId: context.user.id,
        category: input.category,
        emailEnabled: input.emailEnabled,
        pushEnabled: input.pushEnabled,
        inAppEnabled: input.inAppEnabled,
      })
      .onConflictDoUpdate({
        target: [
          NotificationSettingsTable.userId,
          NotificationSettingsTable.category,
        ],
        set: {
          emailEnabled: input.emailEnabled,
          pushEnabled: input.pushEnabled,
          inAppEnabled: input.inAppEnabled,
        },
      });

    return apiResponse(API_MESSAGES.NOTIFICATION.UPDATE_SETTINGS, null);
  }
);

export const markAsReadProcedure = notificationImpl.markAsRead.handler(
  async ({ context, input }) => {
    await context.db
      .update(NotificationTable)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(NotificationTable.recipientId, context.user.id),
          inArray(NotificationTable.id, input.ids)
        )
      );

    return apiResponse(API_MESSAGES.NOTIFICATION.MARK_AS_READ, null);
  }
);

export const subscribePushNotificationProcedure =
  notificationImpl.subscribe.handler(async ({ context, input }) => {
    await context.db
      .insert(PushSubscriptionTable)
      .values({
        userId: context.user.id,
        endpoint: input.endpoint,
        auth: input.auth,
        p256dh: input.p256dh,
        expirationTime: input.expirationTime,
      })
      .onConflictDoUpdate({
        target: [PushSubscriptionTable.endpoint],
        set: {
          auth: input.auth,
          p256dh: input.p256dh,
          expirationTime: input.expirationTime,
        },
      });

    return apiResponse(API_MESSAGES.NOTIFICATION.SUBSCRIBE_PUSH, null);
  });

export const unsubscribePushNotificationProcedure =
  notificationImpl.unsubscribe.handler(async ({ context }) => {
    await context.db
      .delete(PushSubscriptionTable)
      .where(eq(PushSubscriptionTable.userId, context.user.id));

    return apiResponse(API_MESSAGES.NOTIFICATION.UNSUBSCRIBE_PUSH, null);
  });
