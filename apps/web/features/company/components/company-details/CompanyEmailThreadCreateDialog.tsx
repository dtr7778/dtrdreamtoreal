"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
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

import { useCreateCompanyEmailThread } from "../../api/company.api.hook";
import {
  companyThreadCreateSchema,
  CompanyThreadCreateType,
} from "../../company.schema";

export function CompanyEmailThreadCreateDialog({
  companyId,
}: {
  companyId: string;
}) {
  "use no memo";
  const [openDialog, setOpenDialog] = useState(false);

  const form = useForm<CompanyThreadCreateType>({
    resolver: zodResolver(companyThreadCreateSchema),
    defaultValues: {
      companyId,
      subject: "",
    },
  });

  const { mutate, isPending } = useCreateCompanyEmailThread<
    keyof CompanyThreadCreateType
  >({
    onSuccess: () => setOpenDialog(false),
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, { message });
      });
    },
  });

  const handleSubmit = (e: CompanyThreadCreateType) => {
    mutate(e);
  };

  const formId = "create_company_email_tread_form";

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        <span>Add Thread</span>
      </DialogTrigger>

      <DialogResponsiveContent className="w-full sm:max-w-xl">
        <DialogStickyHeader>
          <DialogTitle>Create Email Thread</DialogTitle>
          <DialogDescription>Add a new company email thread</DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <form id={formId} onSubmit={form.handleSubmit(handleSubmit)}>
            <FieldGroup>
              <InputField
                control={form.control}
                name="subject"
                label="Subject"
                placeholder="Thread subject line"
                disabled={isPending}
                requiredField
              />
            </FieldGroup>
          </form>
        </DialogResponsiveBody>
        <DialogStickyFooter>
          <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
          <ButtonSpinner form={formId} isLoading={isPending} type="submit">
            Create Thread
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
