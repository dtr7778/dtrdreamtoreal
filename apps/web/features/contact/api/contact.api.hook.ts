"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { orpcTQClient } from "@/server/orpc.client";
import { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

export function useContactReplyCreate<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "contact_reply_create_toast";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.contact.createReply.mutationOptions({
      onMutate: () => {
        toast.loading("Sending...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { contactId }) => {
        toast.success(message, { id: toastId });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.contact.details.queryKey({
            input: { contactId },
          }),
          exact: true,
        });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.contact.list.queryKey({
            input: {},
          }),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message, type, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }

        toast.error(message ?? "Failed to send reply", { id: toastId });
        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}
