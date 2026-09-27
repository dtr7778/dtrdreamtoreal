"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@workspace/ui/components/button";
import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogResponsiveBody,
  DialogResponsiveContent,
  DialogStickyFooter,
  DialogStickyHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { FieldGroup } from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { TextareaField } from "@workspace/ui/components/form-fields/TextareaField";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { useAuditDetails, useUpdateAudit } from "../api/audit.api.hook";
import { auditUpdateSchema, type AuditUpdateType } from "../audit.schema";

interface AuditUpdateDialogProps {
  auditId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditUpdateDialog({
  auditId,
  open,
  onOpenChange,
}: AuditUpdateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isError, error } = useAuditDetails(auditId, {
    enabled: open && Boolean(auditId),
  });

  const formId = `site_audit_update_form_${auditId ?? "id"}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogResponsiveContent>
        <DialogStickyHeader>
          <DialogTitle>Update audit</DialogTitle>
          <DialogDescription>
            Rename this audit or update its notes. The audit results are not
            affected.
          </DialogDescription>
        </DialogStickyHeader>

        <DialogResponsiveBody>
          <QueryStateBoundary
            data={data?.data}
            isLoading={isLoading}
            isError={isError}
            error={error}
            isEmpty={() => false}
          >
            {(data) => (
              <AuditUpdateDialogForm
                auditId={data.id}
                formId={formId}
                name={data.name}
                description={data.description}
                onSuccess={() => onOpenChange(false)}
                setIsSubmitting={setIsSubmitting}
              />
            )}
          </QueryStateBoundary>
        </DialogResponsiveBody>

        <DialogStickyFooter>
          <DialogClose
            render={<Button variant="outline" disabled={isSubmitting} />}
          >
            Cancel
          </DialogClose>
          <ButtonSpinner form={formId} type="submit" isLoading={isSubmitting}>
            Save changes
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}

function AuditUpdateDialogForm({
  formId,
  auditId,
  onSuccess,
  name,
  description,
  setIsSubmitting,
}: {
  formId: string;
  auditId: string;
  onSuccess: () => void;
  name: string;
  description?: string | null | undefined;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const form = useForm<AuditUpdateType>({
    resolver: zodResolver(auditUpdateSchema),
    defaultValues: { name, description: description ?? "" },
  });

  const { mutate, isPending } = useUpdateAudit({
    onRequestStart: () => setIsSubmitting(true),
    onRequestEnd: () => setIsSubmitting(false),
    onSuccess: onSuccess,
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, { message });
      });
    },
  });

  const handleSubmit = (value: AuditUpdateType) => {
    mutate({
      params: { id: auditId },
      body: value,
    });
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <InputField
          control={form.control}
          name="name"
          label="Audit name"
          requiredField
          disabled={isPending}
        />
        <TextareaField
          control={form.control}
          name="description"
          label="Description"
          className="min-h-24"
          disabled={isPending}
        />
      </FieldGroup>
    </form>
  );
}
