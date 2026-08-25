"use client";

import { useId } from "react";

import { Asterisk, Info } from "lucide-react";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field";

import { FileUpload, FileUploadProps, FileUploadRef } from "../FileUpload";

interface FileUploadFieldProps extends FileUploadProps {
  ref?: React.Ref<FileUploadRef> | undefined;
  label?: string;
  description?: string;
  isDescriptionInfoIconShow?: boolean;
  requiredField?: boolean;
  fieldError?: string | null | undefined;
}

export function FileUploadField({
  label,
  disabled,
  description,
  isDescriptionInfoIconShow,
  requiredField,
  fieldError,
  ...props
}: FileUploadFieldProps) {
  const fieldId = useId();
  return (
    <Field>
      {label && (
        <FieldLabel htmlFor={fieldId} aria-disabled={disabled}>
          {label}
          {requiredField && (
            <Asterisk className="-mt-2 size-3 text-destructive" />
          )}
        </FieldLabel>
      )}
      <FileUpload disabled={disabled} {...props} />
      {description && (
        <FieldDescription
          className="flex items-start gap-1.5"
          aria-disabled={disabled}
        >
          {isDescriptionInfoIconShow && <Info className="mt-0.5 size-4" />}
          {description}
        </FieldDescription>
      )}
      {fieldError && <FieldError errors={[{ message: fieldError }]} />}
    </Field>
  );
}
