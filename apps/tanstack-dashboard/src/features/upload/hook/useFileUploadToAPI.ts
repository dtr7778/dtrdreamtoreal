import type { ProgressType } from "#/components/FileUpload";
import { apiClient } from "#/lib/hono-api";
import { useMutation } from "@tanstack/react-query";

import type { FileEntityTypeEnumType } from "@workspace/drizzle/zod-db-enums";

export interface UploadFileToAPIInput {
  file: File;
  entityType?: FileEntityTypeEnumType;
  entityId?: string;
  scope?: string;
}

export interface UseFileUploadToAPIOptions {
  onProgress?: (progress: ProgressType) => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

function putFileWithProgress({
  url,
  file,
  headers,
  onProgress,
}: {
  url: string;
  file: File;
  headers?: Record<string, string>;
  onProgress?: (progress: ProgressType) => void;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);

    for (const [header, value] of Object.entries(headers ?? {})) {
      xhr.setRequestHeader(header, value);
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return;
      onProgress({
        loaded: event.loaded,
        total: event.total,
        percent: Math.round((event.loaded / event.total) * 100),
      });
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.({
          loaded: file.size,
          total: file.size,
          percent: 100,
        });
        resolve();
        return;
      }
      reject(new Error(`Upload failed with status ${xhr.status}.`));
    };

    xhr.onerror = () => reject(new Error("Upload failed. Please try again."));
    xhr.onabort = () => reject(new Error("Upload was cancelled."));

    xhr.send(file);
  });
}

export function useFileUploadToAPI({
  onProgress,
  onSuccess,
  onError,
}: UseFileUploadToAPIOptions = {}) {
  return useMutation({
    mutationFn: async ({
      file,
      entityType,
      entityId,
      scope,
    }: UploadFileToAPIInput) => {
      const mimeType = file.type || "application/octet-stream";

      const signedRes = await apiClient.upload["signed-url"].$post({
        json: {
          filename: file.name,
          mimeType,
          size: file.size,
          entityType,
          entityId,
          scope,
        },
      });

      if (!signedRes.ok) {
        const body = await signedRes.json().catch(() => null);
        throw new Error(
          (body as { message?: string })?.message ??
            `Failed to get signed URL (${signedRes.status})`
        );
      }

      const signed = await signedRes.json();

      await putFileWithProgress({
        url: signed.data.uploadUrl,
        file,
        headers: {
          "Content-Type": mimeType,
        },
        onProgress,
      });

      const confirmRes = await apiClient.upload["confirm"].$post({
        json: {
          key: signed.data.key,
          filename: file.name,
          originalName: file.name,
          mimeType,
          size: file.size,
          entityType,
          entityId,
        },
      });

      if (!confirmRes.ok) {
        const body = await confirmRes.json().catch(() => null);
        throw new Error(
          (body as { message?: string })?.message ??
            `Failed to confirm upload (${confirmRes.status})`
        );
      }

      return confirmRes.json();
    },
    onSuccess: ({ message }) => {
      onSuccess?.(message);
    },
    onError: (error) => {
      onError?.(error.message);
    },
  });
}
