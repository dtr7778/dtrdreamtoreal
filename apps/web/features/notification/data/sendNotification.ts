import { and, eq } from "drizzle-orm";
import {
  sendNotification as sendWebPushNotification,
  WebPushError,
} from "web-push";

import { type DatabaseType } from "@workspace/drizzle/client";
import {
  InsertNotification,
  NotificationSettingsTable,
  NotificationTable,
  PushSubscriptionTable,
} from "@workspace/drizzle/schemas";
import { type ServerSupabaseClient } from "@workspace/lib/supabase/server-client";

import { env } from "@/lib/env";

import { NOTIFICATION_EVENT, notificationChannel } from "./notificationChannel";

interface SendNotificationProps {
  database: DatabaseType;
  supabaseClient: ServerSupabaseClient;
  payload: InsertNotification;
}

export async function sendNotification({
  database,
  supabaseClient,
  payload,
}: SendNotificationProps) {
  const [notificationSettings] = await database
    .select({
      inAppEnabled: NotificationSettingsTable.inAppEnabled,
      pushEnabled: NotificationSettingsTable.pushEnabled,
      emailEnabled: NotificationSettingsTable.emailEnabled,
    })
    .from(NotificationSettingsTable)
    .where(
      and(
        eq(NotificationSettingsTable.userId, payload.recipientId),
        eq(NotificationSettingsTable.category, payload.category)
      )
    )
    .limit(1);

  const inAppEnabled = notificationSettings?.inAppEnabled ?? true;
  const pushEnabled = notificationSettings?.pushEnabled ?? true;

  if (!inAppEnabled && !pushEnabled) {
    return;
  }

  const [notification] = await database
    .insert(NotificationTable)
    .values(payload)
    .returning();

  if (!notification) {
    throw new Error("Failed to insert notification");
  }

  if (inAppEnabled) {
    await supabaseClient
      .channel(notificationChannel(notification.recipientId))
      .httpSend(NOTIFICATION_EVENT, notification);
  }

  if (pushEnabled) {
    const pushSubscriptions = await database
      .select({
        endpoint: PushSubscriptionTable.endpoint,
        p256dh: PushSubscriptionTable.p256dh,
        auth: PushSubscriptionTable.auth,
        expirationTime: PushSubscriptionTable.expirationTime,
      })
      .from(PushSubscriptionTable)
      .where(eq(PushSubscriptionTable.userId, notification.recipientId));

    await Promise.all(
      pushSubscriptions.map(async (pushSubscription) => {
        try {
          await sendWebPushNotification(
            {
              endpoint: pushSubscription.endpoint,
              keys: {
                p256dh: pushSubscription.p256dh,
                auth: pushSubscription.auth,
              },
              expirationTime: pushSubscription.expirationTime,
            },
            JSON.stringify(notification),
            {
              TTL: 60 * 60,
              vapidDetails: {
                subject: `mailto:${env.SUPPORT_MAIL}`,
                publicKey: env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
                privateKey: env.WEB_PUSH_PRIVATE_KEY,
              },
            }
          );
        } catch (err) {
          console.error("Failed to sending push notification", err);
          if (err instanceof WebPushError) {
            if (err.statusCode === 410 || err.statusCode === 404) {
              await database
                .delete(PushSubscriptionTable)
                .where(
                  eq(PushSubscriptionTable.endpoint, pushSubscription.endpoint)
                );
            }
          }
        }
      })
    );
  }
}
