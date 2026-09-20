"use client";

import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { orpcTQClient } from "@/server/orpc.client";
import { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

export function useCreateEmployee<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "create_employee_toast_message";
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.company.employee.create.mutationOptions({
      onMutate: () => {
        toast.loading("Creating...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message, data }) => {
        toast.success(message, { id: toastId });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.company.employee.list.queryKey({ input: {} }),
          exact: false,
        });

        router.push(`/dashboard/employees/${data.id}`);

        onSuccess?.(message);
      },
      onError: (error) => {
        const { type, message, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }

        toast.error(message, { id: toastId });

        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}

export function useUpdateEmployee<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "update_employee_toast_message";
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.company.employee.update.mutationOptions({
      onMutate: () => {
        toast.loading("Updating...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { employeeId }) => {
        toast.success(message, { id: toastId });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.company.employee.list.queryKey({ input: {} }),
          exact: false,
        });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.company.employee.details.queryKey({
            input: { employeeId },
          }),
          exact: true,
        });

        router.push(`/dashboard/employees/${employeeId}`);

        onSuccess?.(message);
      },
      onError: (error) => {
        const { type, message, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }

        toast.error(message, { id: toastId });

        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}

export function useDeleteEmployee({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput) {
  const toastId = "delete_employee_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.company.employee.delete.mutationOptions({
      onMutate: () => {
        toast.loading("Deleting...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { employeeIds }) => {
        toast.success(message, { id: toastId });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.company.employee.list.queryKey({ input: {} }),
          exact: false,
        });

        for (const employeeId of employeeIds) {
          queryClient.removeQueries({
            queryKey: orpcTQClient.company.employee.details.queryKey({
              input: { employeeId },
            }),
            exact: true,
          });
        }

        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message, { id: toastId });

        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}
