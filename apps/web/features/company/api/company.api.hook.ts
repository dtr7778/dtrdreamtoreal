"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { consumeEventIterator } from "@orpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { orpcClient, orpcTQClient } from "@/server/orpc.client";
import { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

import { AiUsageType } from "../company.schema";

export type GenerateCompanyDescriptionResponse = {
  description: string;
  usage: AiUsageType;
};

export type StreamCompanyDescriptionInput = {
  companyId?: string;
  name: string;
  industry?: string;
  website?: string;
  context?: Record<string, string | string[] | undefined>;
};

export function useStreamCompanyDescription() {
  const toastId = "generate_company_description_toast_message";
  const [isStreaming, setIsStreaming] = useState(false);
  const unsubscribeRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(
    () => () => {
      void unsubscribeRef.current?.();
    },
    []
  );

  const stop = useCallback(() => {
    void unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    setIsStreaming(false);
  }, []);

  const start = useCallback(
    (
      input: StreamCompanyDescriptionInput,
      handlers: {
        onDelta?: (description: string) => void;
        onDone?: (data: GenerateCompanyDescriptionResponse) => void;
        onError?: (message: string) => void;
      } = {}
    ) => {
      let description = "";

      setIsStreaming(true);

      unsubscribeRef.current = consumeEventIterator(
        orpcClient.company.generateDescription(input),
        {
          onEvent: (chunk) => {
            if (chunk.type === "delta") {
              description += chunk.value;
              handlers.onDelta?.(description);
              return;
            }

            handlers.onDone?.({
              description,
              usage: chunk.usage,
            });
          },
          onError: (error) => {
            const { message } = formatOrpcError(error);
            toast.error(message, { id: toastId });
            handlers.onError?.(message);
          },
          onFinish: () => {
            setIsStreaming(false);
            unsubscribeRef.current = null;
          },
        }
      );
    },
    []
  );

  return { start, stop, isStreaming };
}

export function useCreateCompany<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "create_company_toast_message";
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.company.create.mutationOptions({
      onMutate: () => {
        toast.loading("Creating...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message, data }) => {
        toast.success(message, { id: toastId });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.company.list.queryKey({ input: {} }),
          exact: false,
        });

        router.push(`/dashboard/companies/${data.id}`);

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

export function useUpdateCompany<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "update_company_toast_message";
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.company.update.mutationOptions({
      onMutate: () => {
        toast.loading("Updating...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { companyId }) => {
        toast.success(message, { id: toastId });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.company.list.queryKey({ input: {} }),
          exact: false,
        });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.company.details.queryKey({
            input: { companyId },
          }),
          exact: true,
        });

        router.push(`/dashboard/companies/${companyId}`);

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

export function useDeleteCompany({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput) {
  const toastId = "delete_company_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.company.delete.mutationOptions({
      onMutate: () => {
        toast.loading("Deleting...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { companyIds }) => {
        toast.success(message, { id: toastId });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.company.list.queryKey({ input: {} }),
          exact: false,
        });

        for (const companyId of companyIds) {
          queryClient.removeQueries({
            queryKey: orpcTQClient.company.details.queryKey({
              input: { companyId },
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

export function useCreateCompanyEmailThread<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "create_company_email_thread_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.company.emailThread.create.mutationOptions({
      onMutate: () => {
        toast.loading("Creating...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, { companyId }) => {
        toast.success(message, { id: toastId });

        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.company.emailThread.list.queryKey({
            input: { companyId },
          }),
          exact: false,
        });

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
