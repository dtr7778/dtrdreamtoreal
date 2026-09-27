"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
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
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { FieldGroup } from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { TextareaField } from "@workspace/ui/components/form-fields/TextareaField";

import { useCreateAudit } from "../api/audit.api.hook";
import { auditCreateSchema, type AuditCreateType } from "../audit.schema";
import { AuditProgressDialog } from "./AuditProgressDialog";

const FORM_ID = "site_audit_create_form_id";

export function AuditCreateDialog({
  companyId,
  websiteUrl,
}: {
  companyId: string;
  websiteUrl?: string | null | undefined;
}) {
  const [openDialog, setOpenDialog] = useState(false);
  const [openProgressDialog, setOpenProgressDialog] = useState(false);
  const [createdAudit, setCreatedAudit] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const form = useForm<AuditCreateType>({
    resolver: zodResolver(auditCreateSchema),
    defaultValues: {
      name: "",
      url: websiteUrl ?? "",
      description: "",
    },
  });

  const { mutateAsync, isPending } = useCreateAudit({
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, { message });
      });
    },
  });

  const handleSubmit = async (values: AuditCreateType) => {
    try {
      const response = await mutateAsync({
        body: { ...values, companyId },
      });

      form.reset();
      setOpenDialog(false);
      setCreatedAudit({ id: response.data.id, name: response.data.name });
      setOpenProgressDialog(true);
    } catch {
      // Errors are surfaced by the mutation hook.
    }
  };

  return (
    <>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger
          render={<Button className="w-fit" disabled={isPending} />}
        >
          <PlusCircle />
          <span>New audit</span>
        </DialogTrigger>
        <DialogResponsiveContent>
          <DialogStickyHeader>
            <DialogTitle>Run a new site audit</DialogTitle>
            <DialogDescription>
              We will crawl the site and run every automated check in the
              background. You can follow the progress live after starting.
            </DialogDescription>
          </DialogStickyHeader>

          <DialogResponsiveBody>
            <form
              id={FORM_ID}
              onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}
            >
              <FieldGroup>
                <InputField
                  control={form.control}
                  name="name"
                  label="Audit name"
                  requiredField
                  placeholder="e.g. Homepage audit Q3"
                  disabled={isPending}
                />
                <InputField
                  control={form.control}
                  name="url"
                  type="url"
                  label="Website URL"
                  requiredField
                  placeholder="https://example.com"
                  disabled={isPending}
                />
                <TextareaField
                  control={form.control}
                  name="description"
                  label="Description"
                  placeholder="Optional notes about this audit..."
                  className="min-h-24"
                  disabled={isPending}
                />
              </FieldGroup>
            </form>
          </DialogResponsiveBody>

          <DialogStickyFooter>
            <DialogClose
              render={<Button variant="outline" disabled={isPending} />}
            >
              Cancel
            </DialogClose>
            <ButtonSpinner form={FORM_ID} type="submit" isLoading={isPending}>
              Start audit
            </ButtonSpinner>
          </DialogStickyFooter>
        </DialogResponsiveContent>
      </Dialog>

      <AuditProgressDialog
        auditId={createdAudit?.id ?? ""}
        auditName={createdAudit?.name}
        open={openProgressDialog}
        onOpenChange={setOpenProgressDialog}
      />
    </>
  );
}
