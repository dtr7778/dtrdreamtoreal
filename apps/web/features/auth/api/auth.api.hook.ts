import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { orpcTQClient } from "@/server/orpc.client";
import { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

export function useRequestPasswordReset({
  onRequestStart,
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors"> = {}) {
  const toastId = "request_password_reset_toast_message";

  return useMutation(
    orpcTQClient.auth.requestResetPassword.mutationOptions({
      onMutate: () => {
        toast.loading("Loading...", {
          id: toastId,
        });
        onRequestStart?.();
      },
      onSuccess: ({ message }) => {
        toast.success("Password reset email sent", { id: toastId });
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message ?? "Failed to send password reset email", {
          id: toastId,
        });

        onError?.(message);
      },
    })
  );
}

export function useBanUnbannedUser<TFieldNames>({
  onSuccess,
  onRequestStart,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames> = {}) {
  const toastId = "ban_unbanned_user_toast_message";

  return useMutation(
    orpcTQClient.auth.ban.mutationOptions({
      onMutate: () => {
        toast.loading("Loading...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message, type, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }

        toast.error(message ?? "Failed to ban user", { id: toastId });

        onError?.(message);
      },
    })
  );
}
