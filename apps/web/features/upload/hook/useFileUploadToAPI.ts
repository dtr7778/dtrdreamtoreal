import { useMutation } from "@tanstack/react-query";

import { EntityTypeEnumType } from "@workspace/drizzle/zod-db-enums";

import { ProgressType } from "@/components/FileUpload";

import { IApiHookInput } from "@/types";
import { formatOrpcError } from "@/utils/formatOrpcError";

import { useConfirmUpload, useGetUploadUrl } from "../api/upload.api.hook";
import { ConfirmUploadContractType } from "../api/upload.contract";

interface UseFileUploadProps extends Omit<IApiHookInput, "onValidationErrors"> {
  onProgress?: (progress: ProgressType) => void;
}

export function useFileUploadToAPI({
  onProgress,
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
}: UseFileUploadProps) {
  const { mutateAsync: getUploadUrl } = useGetUploadUrl({});
  const { mutateAsync: confirmUpload } = useConfirmUpload({});

  return useMutation<
    ConfirmUploadContractType["output"],
    Error,
    {
      file: File;
      path: string;
      entityType: EntityTypeEnumType;
      entityId?: string;
    }
  >({
    mutationKey: ["upload-file"],
    mutationFn: async ({ file, path, entityType, entityId }) => {
      const {
        data: { signedUrl, key },
      } = await getUploadUrl({
        filename: file.name,
        entityType,
        path,
      });

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            onProgress({
              loaded: e.loaded,
              total: e.total,
              percent: Math.round((e.loaded / e.total) * 100),
            });
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(file);
      });

      return confirmUpload({
        key,
        path,
        filename: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        entityType,
        entityId,
      });
    },
    onMutate: () => {
      onRequestStart?.();
    },
    onSuccess: ({ message }) => {
      onSuccess?.(message);
    },
    onError: (error) => {
      const { message } = formatOrpcError(error);
      onError?.(message);
    },
    onSettled: () => {
      onRequestEnd?.();
    },
  });
}
