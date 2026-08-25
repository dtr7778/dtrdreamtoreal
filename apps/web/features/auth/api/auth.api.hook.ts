import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { ListUserContractType } from "@/features/user/api/user.contract";
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
  onRequestEnd,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames> = {}) {
  const toastId = "ban_unbanned_user_toast_message";
  const queryClient = useQueryClient();
  const userListQueryKey = orpcTQClient.user.list.queryKey({ input: {} });

  return useMutation(
    orpcTQClient.auth.ban.mutationOptions({
      onMutate: async (inputData) => {
        toast.loading("Loading...", { id: toastId });
        onRequestStart?.();

        await queryClient.cancelQueries({
          queryKey: userListQueryKey,
          exact: false,
        });

        const previousListUsersData = queryClient.getQueriesData<
          ListUserContractType["output"]
        >({
          queryKey: userListQueryKey,
          exact: false,
        });

        queryClient.setQueriesData(
          {
            queryKey: userListQueryKey,
            exact: false,
          },
          (oldData: ListUserContractType["output"]) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              data: {
                meta: oldData.data.meta,
                data: oldData.data.data.map((user) => {
                  if (user.id === inputData.userId) {
                    return {
                      ...user,
                      banned: inputData?.banned,
                      banExpires: inputData?.banExpires,
                      banReason: inputData?.banReason,
                    };
                  }
                  return user;
                }),
              },
            };
          }
        );

        return {
          previousListUsersData: previousListUsersData[0]?.[1],
        };
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.user.list.queryKey({
            input: {},
          }),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error, _var, context) => {
        queryClient.setQueryData(
          userListQueryKey,
          context?.previousListUsersData
        );

        const { message, type, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }

        toast.error(message ?? "Failed to ban user", { id: toastId });

        onError?.(message);
      },
      onSettled: async () => {
        onRequestEnd?.();

        await queryClient.invalidateQueries({
          queryKey: userListQueryKey,
          exact: false,
        });
      },
    })
  );
}
