"use client";

import { useRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCcw } from "lucide-react";
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
import { PhoneInputField } from "@workspace/ui/components/form-fields/PhoneInputField";
import { TextareaField } from "@workspace/ui/components/form-fields/TextareaField";

import { companyUpdateSchema, CompanyUpdateType } from "../../company.schema";

interface CompanyUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues: {
    name: string;
    legalName?: string;
    website?: string;
    industry?: string;
    employSize?: string;
    email?: string;
    phone?: string;
    description?: string;
  };
  onSubmit: (
    values: Omit<CompanyUpdateType, "socialMedia" | "addresses" | "context">
  ) => void;
  isPending?: boolean;
}

export function CompanyUpdateDialog({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  isPending = false,
}: CompanyUpdateDialogProps) {
  "use no memo";
  const form = useForm<CompanyUpdateType>({
    resolver: zodResolver(companyUpdateSchema),
    defaultValues: {
      name: defaultValues.name,
      legalName: defaultValues.legalName ?? "",
      email: defaultValues.email ?? "",
      phone: defaultValues.phone ?? "",
      employSize: defaultValues.employSize ?? "",
      industry: defaultValues.industry ?? "",
      website: defaultValues.website ?? "",
      description: defaultValues.description ?? "",
    },
  });

  const formId = "company_update_form";

  const defaultValuesRef = useRef(defaultValues);

  const isDirty = form.formState.isDirty;

  const handleReset = () => {
    form.reset(defaultValuesRef.current);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogResponsiveContent className="w-full sm:max-w-2xl">
        <DialogStickyHeader>
          <DialogTitle>Update information</DialogTitle>
          <DialogDescription>
            Edit the company basic information
          </DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <InputField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Company name"
                disabled={isPending}
                requiredField
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  control={form.control}
                  name="legalName"
                  label="Legal name"
                  placeholder="Legal name"
                  disabled={isPending}
                />
                <InputField
                  control={form.control}
                  name="employSize"
                  label="Employee Size"
                  placeholder="1-10, 11-50, 51-200, etc."
                  disabled={isPending}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  control={form.control}
                  type="email"
                  name="email"
                  label="Email"
                  placeholder="contact@company.com"
                  disabled={isPending}
                />
                <PhoneInputField
                  control={form.control}
                  name="phone"
                  label="Phone"
                  placeholder="+1 234 567 890"
                  disabled={isPending}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  control={form.control}
                  type="url"
                  name="website"
                  label="Website"
                  placeholder="https://company.com"
                  disabled={isPending}
                />
                <InputField
                  control={form.control}
                  name="industry"
                  label="Industry"
                  disabled={isPending}
                />
              </div>

              <TextareaField
                control={form.control}
                name="description"
                label="Description"
                placeholder="Brief description of the company"
                disabled={isPending}
              />
            </FieldGroup>
          </form>
        </DialogResponsiveBody>
        <DialogStickyFooter>
          <p className="me-auto hidden text-xs text-muted-foreground sm:block">
            {isDirty
              ? "Your changes will be saved."
              : "Modify a field to enable saving."}
          </p>
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={!isDirty || isPending}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <ButtonSpinner
            form={formId}
            isLoading={isPending}
            type="submit"
            variant={isDirty ? "default" : "outline"}
            disabled={!isDirty}
          >
            Save
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
