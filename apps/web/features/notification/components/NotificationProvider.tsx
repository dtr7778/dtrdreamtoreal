"use client";

import { useCallback, useEffect, useMemo } from "react";

import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { supabaseBrowserClient } from "@/lib/supabase/browser-client";

import { usePageVisibility } from "@/hooks/use-page-visibility";
import { orpcTQClient } from "@/server/orpc.client";
import { useAuthStore } from "@/stores/zustand/auth/AuthStoreContext";

import type { ListNotificationContractType } from "../api/notification.contract";
import { chimeSound } from "../data/notification-sound";
import {
  NOTIFICATION_EVENT,
  notificationChannel,
} from "../data/notificationChannel";

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = useAuthStore((state) => state.user!);
  const { isVisible } = usePageVisibility();
  const queryClient = useQueryClient();

  const toastId = "notification_toast_message";

  const channelName = useMemo(
    () => notificationChannel(authUser.id),
    [authUser.id]
  );

  const addNotification = useCallback(
    async (
      notification: ListNotificationContractType["output"]["data"]["data"][number]
    ) => {
      queryClient.setQueryData(
        orpcTQClient.notification.list.queryKey({
          input: {},
        }),
        (oldData) => {
          if (!oldData) return oldData;

          const currentNotifications = oldData.data.data;
          const lastNotification = currentNotifications[0];

          if (lastNotification?.id === notification.id) {
            return oldData;
          }

          return {
            ...oldData,
            data: {
              meta: {
                ...oldData.data.meta,
                totalCount: oldData.data.meta.totalCount + 1,
              },
              data: [notification, ...currentNotifications],
            },
          };
        }
      );

      if (isVisible) {
        toast(notification.title, {
          icon: "🔔",
          duration: 5000,
          id: toastId,
        });
        chimeSound()
          .then(() => {})
          .catch(() => {});
      }

      await queryClient.invalidateQueries({
        queryKey: orpcTQClient.notification.list.queryKey({
          input: {},
        }),
      });
    },
    [isVisible, queryClient]
  );

  useEffect(() => {
    const channel = supabaseBrowserClient
      .channel(channelName)
      .on("broadcast", { event: NOTIFICATION_EVENT }, async ({ payload }) => {
        await addNotification(payload);
      })
      .subscribe((status, err) => {
        if (err) {
          toast.error(err.message);
        }
        console.log(status);
      });

    return () => {
      supabaseBrowserClient.removeChannel(channel);
    };
  }, [channelName, addNotification]);

  return children;
}
