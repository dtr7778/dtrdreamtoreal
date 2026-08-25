"use client";

import Image from "next/image";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { FileIcon, ImageUp, UploadCloud, XIcon } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@workspace/ui/components/progress";
import { cn } from "@workspace/ui/lib/utils";

import {
  DEFAULT_MAX_SIZE,
  FileMetadata,
  FileWithPreview,
  useFileUpload,
} from "@/hooks/use-file-upload";
import { formatBytes } from "@/utils/formatBytes";

export type ProgressType = {
  loaded: number;
  total: number;
  percent: number;
};

export function useFileUploadState() {
  "use no memo";
  const [fileValue, setFileValue] = useState<File | File[] | null | undefined>(
    () => null
  );
  const [uploadingProgress, setUploadingProgress] = useState<ProgressType>({
    loaded: 0,
    total: 0,
    percent: 0,
  });
  const [fileError, setFileError] = useState<string | null>(null);
  const uploadRef = useRef<FileUploadRef>(null);

  return {
    fileValue,
    setFileValue,
    fileError,
    setFileError,
    uploadingProgress,
    setUploadingProgress,
    uploadRef,
  };
}

export type FileUploadVariant = "image" | "document" | "any";

const VARIANT_ACCEPT: Record<FileUploadVariant, string> = {
  image: "image/*",
  document: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv",
  any: "*",
};

export interface FileUploadValidation {
  /** Max file size in bytes. Defaults to 5 MB. */
  maxSize?: number;
  /** Custom validator. Return an error string or null. */
  validate?: (file: File) => string | null;
}

export interface FileUploadProps {
  /** Current value: a URL string, a File object, or null. */
  value: string | string[] | File | File[] | null | undefined;
  /** Called whenever the selected file changes. */
  onChange: (file: File | File[] | null | undefined) => void;
  /** Called with a validation error message when a file is rejected. */
  onError?: (message: string) => void;
  /** Upload progress */
  uploadingProgress: ProgressType;
  /** Whether the control is disabled. */
  disabled?: boolean;
  /** Allow multiple file selection. Defaults to false. */
  multiple?: boolean;
  /** MIME-type accept string, e.g. "image/*" or ".pdf,.docx". */
  accept?: string;
  /** Controls the visual preset. Defaults to "any". */
  variant?: FileUploadVariant;
  /** Extra className applied to the root wrapper. */
  className?: string;
  /** className applied to the dropzone button. */
  dropzoneClassName?: string;
  /** Validation rules. */
  validation?: FileUploadValidation;
  /** Hide the remove button. Defaults to false. */
  hideRemove?: boolean;
}

export interface FileUploadRef {
  clearErrors: () => void;
  clearFiles: () => void;
  openFileDialog: () => void;
}

export const FileUpload = forwardRef<FileUploadRef, FileUploadProps>(
  (
    {
      value,
      onChange,
      onError,
      className,
      dropzoneClassName,
      uploadingProgress,
      accept,
      variant = "any",
      validation,
      multiple = false,
      disabled = false,
      hideRemove = false,
    },
    ref
  ) => {
    "use no memo";

    const resolvedAccept = accept ?? VARIANT_ACCEPT[variant];
    const maxSize = validation?.maxSize ?? DEFAULT_MAX_SIZE;

    const getInitialFiles = useCallback((): FileMetadata[] => {
      if (!value) return [];

      const values = Array.isArray(value) ? value : [value];

      return values.map((val, index) => {
        if (val instanceof File) {
          return {
            id: `initial-${val.name}-${index}-${Date.now()}`,
            name: val.name,
            size: val.size,
            type: val.type,
            url: URL.createObjectURL(val),
          };
        }
        // It's a string URL
        return {
          id: `initial-url-${index}-${Date.now()}`,
          name: val.split("/").pop() || `file-${index}`,
          size: 0,
          type: "",
          url: val,
        };
      });
    }, [value]);

    const [
      { files, isDragging, errors },
      {
        removeFile,
        openFileDialog,
        getInputProps,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
        clearErrors,
        clearFiles,
      },
    ] = useFileUpload({
      accept: resolvedAccept,
      multiple,
      maxSize,
      initialFiles: getInitialFiles(),
    });

    useImperativeHandle(ref, () => ({
      clearErrors,
      clearFiles,
      openFileDialog,
    }));

    useEffect(() => {
      if (errors.length > 0 && onError) {
        onError(errors.join(", "));
      }
    }, [errors, onError]);

    const handleChange = useCallback(
      (files: FileWithPreview[]) => {
        if (files.length === 0) {
          onChange(null);
          return;
        }

        if (multiple) {
          const fileArray = files
            .map((f) => (f.file instanceof File ? f.file : null))
            .filter((f): f is File => f !== null);
          onChange(fileArray.length > 0 ? fileArray : null);
        } else {
          const file = files[0]?.file;
          onChange(file instanceof File ? file : null);
        }
      },
      [onChange, multiple]
    );

    useEffect(() => {
      handleChange(files);
    }, [handleChange, files]);

    const handleRemove = useCallback(
      (fileId: string) => {
        removeFile(fileId);

        const remainingFiles = files.filter((f) => f.id !== fileId);
        if (remainingFiles.length === 0) {
          onChange(null);
        } else if (multiple) {
          const fileArray = remainingFiles
            .map((f) => (f.file instanceof File ? f.file : null))
            .filter((f): f is File => f !== null);
          onChange(fileArray.length > 0 ? fileArray : null);
        } else {
          const file = remainingFiles[0]?.file;
          onChange(file instanceof File ? file : null);
        }
      },
      [onChange, removeFile, files, multiple]
    );

    const hasFile = files.length > 0;
    const isInteractive = !disabled;

    return (
      <div
        className={cn(
          "relative flex w-full h-40 rounded-lg p-4 border border-dashed border-input overflow-y-auto transition-colors items-center justify-center",
          className
        )}
      >
        {uploadingProgress.percent > 0 && (
          <div className="absolute z-20 inset-0 w-full h-full bg-background/80 backdrop-blur-sm flex flex-col gap-2 items-center justify-center">
            <Progress
              value={uploadingProgress.percent}
              className="w-[60%] gap-1"
            >
              <ProgressLabel>
                {uploadingProgress.percent < 100
                  ? "Uploading..."
                  : "Uploaded 🎉"}
              </ProgressLabel>
              <ProgressValue />
              <ProgressTrack className="h-2">
                <ProgressIndicator />
              </ProgressTrack>
            </Progress>
          </div>
        )}
        <div
          aria-label={"Upload file"}
          aria-busy={disabled}
          tabIndex={disabled ? -1 : 0}
          data-dragging={isDragging || undefined}
          onDragEnter={isInteractive ? handleDragEnter : undefined}
          onDragLeave={isInteractive ? handleDragLeave : undefined}
          onDragOver={isInteractive ? handleDragOver : undefined}
          onDrop={isInteractive ? handleDrop : undefined}
          className={cn(
            // Base
            "relative flex gap-2 flex-wrap size-full cursor-pointer items-center justify-center outline-none",
            // States
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:opacity-50",
            // Drag-over highlight
            "data-dragging:bg-accent/50",
            dropzoneClassName
          )}
        >
          {hasFile ? (
            files.map((file) =>
              file.file.type.startsWith("image/") && file.preview ? (
                <DefaultImagePreview
                  key={file.id}
                  handleRemove={() => handleRemove(file.id)}
                  url={file.preview}
                  hideRemove={hideRemove}
                />
              ) : (
                <DefaultFilePreview
                  key={file.id}
                  file={file.file as File}
                  handleRemove={() => handleRemove(file.id)}
                  hideRemove={hideRemove}
                />
              )
            )
          ) : (
            <DefaultPlaceholder
              variant={variant}
              isDragging={isDragging}
              onUploadClick={isInteractive ? openFileDialog : undefined}
              maxSize={maxSize}
            />
          )}
        </div>

        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload file input"
          tabIndex={-1}
          disabled={disabled}
        />
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";

function DefaultPlaceholder({
  variant,
  isDragging,
  maxSize,
  onUploadClick,
}: {
  variant: FileUploadVariant;
  isDragging: boolean;
  maxSize: number;
  onUploadClick?: () => void;
}) {
  const Icon =
    variant === "image"
      ? ImageUp
      : variant === "document"
        ? FileIcon
        : UploadCloud;

  return (
    <div
      className="flex flex-col items-center justify-center gap-2 text-center select-none"
      aria-hidden="true"
    >
      <Icon className="size-10 stroke-1 opacity-60" />
      <div className="space-y-0.5">
        <p className="text-sm font-medium">
          {isDragging ? "Drop to upload" : "Drag & drop or click to browse"}
        </p>
        <p className="text-xs opacity-60">
          {`Accepted: ${variant} · Max ${formatBytes(maxSize)}`}
        </p>
      </div>
      <Button onClick={onUploadClick}>Choose a File</Button>
    </div>
  );
}

function DefaultFilePreview({
  file,
  handleRemove,
  hideRemove = false,
}: {
  file: File;
  handleRemove: () => void;
  hideRemove?: boolean;
}) {
  return (
    <div className="relative aspect-square w-25 border rounded-md">
      <div className="flex text-center flex-col items-center justify-center gap-2 w-full h-full">
        <FileIcon className="size-10 stroke-1 opacity-60" />
        <div className="space-y-0.5">
          <p className="max-w-50 truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatBytes(file.size)}
          </p>
        </div>
      </div>
      {!hideRemove && <RemoveButton onClick={handleRemove} />}
    </div>
  );
}

function DefaultImagePreview({
  url,
  handleRemove,
  width = 256,
  height = 256,
  hideRemove = false,
}: {
  url: string;
  handleRemove: () => void;
  width?: number;
  height?: number;
  hideRemove?: boolean;
}) {
  return (
    <div className="relative aspect-square size-30 border rounded-md overflow-hidden">
      <Image
        className="object-contain w-full h-full object-center"
        src={url}
        alt="Uploaded image"
        width={width}
        height={height}
        unoptimized
      />
      {!hideRemove && <RemoveButton onClick={handleRemove} />}
    </div>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  const handleRemove = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();
    onClick();
  };

  return (
    <Button
      type="button"
      size="icon-xs"
      onClick={handleRemove}
      aria-label="Remove file"
      className="absolute top-[2%] right-[2%] z-10"
    >
      <XIcon />
    </Button>
  );
}
