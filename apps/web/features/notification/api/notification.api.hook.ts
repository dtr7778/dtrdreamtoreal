"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { orpcTQClient } from "@/server/orpc.client";
import { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

export function useNotificationSettingsUpdate<TFieldNames>({
  onSuccess,
  onError,
  onRequestStart,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "update_notification_setting_toast";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.notification.updateSettings.mutationOptions({
      onMutate: () => {
        toast.loading("Updating...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.notification.settings.queryKey(),
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message, type, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }

        toast.error(message || "Failed to update preference", { id: toastId });

        onError?.(message);
      },
    })
  );
}

export function useNotificationMarkAsRead<TFieldNames>({
  onSuccess,
  onError,
  onRequestStart,
}: Omit<IApiHookInput<TFieldNames>, "onValidationErrors"> = {}) {
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.notification.markAsRead.mutationOptions({
      onMutate: () => {
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.notification.list.queryKey({ input: {} }),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        onError?.(message);
      },
    })
  );
}
