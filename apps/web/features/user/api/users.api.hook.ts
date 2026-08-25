"use client";

import { RefObject } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { downloadFile } from "@workspace/ui/lib/downloadFile";

import { FileUploadRef, ProgressType } from "@/components/FileUpload";

import { useFileUploadToAPI } from "@/features/upload/hook/useFileUploadToAPI";
import { orpcTQClient } from "@/server/orpc.client";
import { useAuthStore } from "@/stores/zustand/auth/AuthStoreContext";
import { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

import { ProfileUpdateContractType } from "./user.contract";

export function useUserExportData({
  onRequestStart,
  onSuccess,
  onError,
}: IApiHookInput = {}) {
  const toastId = "export_user_data_toast_id";

  return useMutation(
    orpcTQClient.user.export.mutationOptions({
      onMutate: () => {
        toast.loading("Exporting...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: ({ message, data }) => {
        const content =
          typeof data.data === "string"
            ? data.data
            : JSON.stringify(data.data, null, 2);

        downloadFile(content, data.filename, data.contentType);
        toast.success(message, { id: toastId });
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);
        toast.error(message, { id: toastId });
        onError?.(message);
      },
    })
  );
}

export function useProfileUpdate<TFieldNames>({
  uploadRef,
  onProgress,
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames> & {
  uploadRef: RefObject<FileUploadRef | null>;
  onProgress?: (progress: ProgressType) => void;
}) {
  const toastId = "profile_update_toast_message";
  const addUserData = useAuthStore((state) => state.addUserData);

  const { mutateAsync: updateProfile } = useMutation(
    orpcTQClient.user.updateProfile.mutationOptions()
  );
  const { mutateAsync: updateImage } = useFileUploadToAPI({
    onProgress,
    onSuccess: () => {
      uploadRef.current?.clearFiles();
      uploadRef.current?.clearErrors();
    },
  });

  return useMutation<
    ProfileUpdateContractType["output"],
    Error,
    Omit<ProfileUpdateContractType["input"], "imageId"> & {
      profileImage: File | File[] | null | undefined;
    }
  >({
    mutationKey: ["profile-update"],
    mutationFn: async ({ profileImage, ...restInput }) => {
      let imageId: string | undefined = undefined;

      if (profileImage) {
        const { data } = await updateImage({
          file: Array.isArray(profileImage) ? profileImage[0]! : profileImage,
          entityType: "profile_image",
          path: "profile_image",
        });
        imageId = data.id;
      }

      return updateProfile({ ...restInput, imageId });
    },
    onMutate: () => {
      toast.loading("Updating...", { id: toastId });
      onRequestStart?.();
    },
    onSuccess: async ({ message, data }) => {
      addUserData({
        ...data,
        image: data.image,
        name: data.name,
      });

      toast.success(message, { id: toastId });
      onSuccess?.(message);
    },
    onError: (error) => {
      const { message, type, fieldErrors } =
        formatOrpcError<TFieldNames>(error);

      if (type === "validation") {
        onValidationErrors?.(fieldErrors ?? []);
      }

      toast.error(message ?? "Failed to update profile", { id: toastId });

      onError?.(message);
    },
    onSettled: () => {
      onRequestEnd?.();
    },
  });
}

export function useRoleUpdate<TFieldNames>({
  onRequestStart,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames> = {}) {
  const toastId = "update_role_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.user.updateRole.mutationOptions({
      onMutate: () => {
        toast.loading("Updating...", { id: toastId });
        onRequestStart?.();
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
      onError: (error) => {
        const { message, type, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation") {
          onValidationErrors?.(fieldErrors ?? []);
        }

        toast.error(message ?? "Failed to update role", { id: toastId });

        onError?.(message);
      },
    })
  );
}
