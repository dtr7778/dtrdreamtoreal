"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";

import { apiClient } from "@/lib/api";

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "@/constants";
import { IApiHookInput } from "@/types";

import type { AuditCreateType, AuditUpdateType } from "../audit.schema";

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    return data?.message ?? data?.error ?? error.message;
  }

  if (error instanceof Error) return error.message;

  return "Something went wrong. Please try again.";
}

function getFieldErrors(
  error: unknown
): Array<{ fieldName: string; message: string }> {
  if (!isAxiosError(error)) return [];

  const data = error.response?.data as
    | {
        data?: { fieldErrors?: Record<string, Array<string> | undefined> };
        fieldErrors?: Record<string, Array<string> | undefined>;
      }
    | undefined;

  const fieldErrors = data?.data?.fieldErrors ?? data?.fieldErrors;
  if (!fieldErrors) return [];

  return Object.entries(fieldErrors).flatMap(([fieldName, messages]) =>
    (messages ?? []).map((message) => ({ fieldName, message }))
  );
}

export function useAuditDetails(
  auditId: string,
  options?: { enabled?: boolean; poll?: boolean }
) {
  return useQuery(
    apiClient.siteAudit.get.queryOptions({
      input: { params: { id: auditId } },
      enabled: options?.enabled ?? true,
    })
  );
}

export function useAuditResults(
  auditId: string,
  options?: { enabled?: boolean }
) {
  return useQuery(
    apiClient.siteAudit.getResult.queryOptions({
      input: { params: { id: auditId } },
      enabled: options?.enabled ?? true,
    })
  );
}

export function useAuditCwvHistory(
  auditId: string,
  options?: { enabled?: boolean }
) {
  return useQuery(
    apiClient.siteAudit.cwv.list.queryOptions({
      input: {
        params: { id: auditId },
        query: {
          page: DEFAULT_PAGE_INDEX,
          limit: DEFAULT_PAGE_SIZE,
          order: "desc",
          orderField: "createdAt",
        },
      },
      enabled: options?.enabled ?? true,
    })
  );
}

export function useCreateAudit({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<keyof AuditCreateType>) {
  const AUDIT_CREATE_TOAST_ID = "create_site_audit_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    apiClient.siteAudit.create.mutationOptions({
      onMutate: () => {
        toast.loading("Starting audit...", { id: AUDIT_CREATE_TOAST_ID });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: AUDIT_CREATE_TOAST_ID });

        await queryClient.invalidateQueries({
          queryKey: apiClient.siteAudit.list.queryKey({ query: {} }),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        const fieldErrors = getFieldErrors(error);
        if (fieldErrors.length > 0) {
          onValidationErrors?.(fieldErrors as never);
        }

        toast.error(getErrorMessage(error), { id: AUDIT_CREATE_TOAST_ID });
        onError?.(getErrorMessage(error));
      },
      onSettled: () => onRequestEnd?.(),
    })
  );
}

export function useUpdateAudit({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<keyof AuditUpdateType>) {
  const queryClient = useQueryClient();
  const AUDIT_UPDATE_TOAST_ID = "update_site_audit_toast_message";

  return useMutation(
    apiClient.siteAudit.update.mutationOptions({
      onMutate: () => {
        toast.loading("Updating audit...", { id: AUDIT_UPDATE_TOAST_ID });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, variables) => {
        toast.success(message, { id: AUDIT_UPDATE_TOAST_ID });

        await queryClient.invalidateQueries({
          queryKey: apiClient.siteAudit.list.queryKey({ query: {} }),
          exact: false,
        });

        await queryClient.invalidateQueries({
          queryKey: apiClient.siteAudit.get.queryKey({
            params: { id: variables.params.id },
          }),
          exact: true,
        });
        onSuccess?.(message);
      },
      onError: (error) => {
        const fieldErrors = getFieldErrors(error);
        if (fieldErrors.length > 0) {
          onValidationErrors?.(fieldErrors as never);
        }

        toast.error(getErrorMessage(error), { id: AUDIT_UPDATE_TOAST_ID });
        onError?.(getErrorMessage(error));
      },
      onSettled: () => onRequestEnd?.(),
    })
  );
}

export function useDeleteAudit({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: IApiHookInput) {
  const queryClient = useQueryClient();
  const AUDIT_DELETE_TOAST_ID = "delete_site_audit_toast_message";

  return useMutation(
    apiClient.siteAudit.delete.mutationOptions({
      onMutate: () => {
        toast.loading("Deleting audit...", { id: AUDIT_DELETE_TOAST_ID });
        onRequestStart?.();
      },
      onSuccess: async ({ message }, variables) => {
        toast.success(message, { id: AUDIT_DELETE_TOAST_ID });
        queryClient.removeQueries({
          queryKey: apiClient.siteAudit.get.queryKey({
            params: { id: variables.params.id },
          }),
          exact: true,
        });

        await queryClient.invalidateQueries({
          queryKey: apiClient.siteAudit.list.queryKey({ query: {} }),
          exact: false,
        });

        onSuccess?.(message);
      },
      onError: (error) => {
        toast.error(getErrorMessage(error), { id: AUDIT_DELETE_TOAST_ID });
        onError?.(getErrorMessage(error));
      },
      onSettled: () => onRequestEnd?.(),
    })
  );
}
