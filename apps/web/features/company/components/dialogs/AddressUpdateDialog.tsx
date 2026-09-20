"use client";

import { useEffect, useRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

import { AddressTypeEnumType } from "@workspace/drizzle/zod-db-enums";
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

import { addressCreateSchema, AddressCreateType } from "../../company.schema";
import { AddressField } from "../forms/AddressField";

const addressUpdateFormSchema = z.object({
  addresses: z.array(addressCreateSchema),
});

export type AddressUpdateFormType = z.infer<typeof addressUpdateFormSchema>;

interface AddressUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues: AddressCreateType[];
  defaultType: AddressTypeEnumType;
  onSubmit: (values: AddressUpdateFormType) => void;
  isPending?: boolean;
}

export function AddressUpdateDialog({
  open,
  onOpenChange,
  defaultValues,
  defaultType,
  onSubmit,
  isPending = false,
}: AddressUpdateDialogProps) {
  "use no memo";
  const form = useForm<AddressUpdateFormType>({
    resolver: zodResolver(addressUpdateFormSchema),
    defaultValues: { addresses: defaultValues },
  });

  const defaultValuesRef = useRef(defaultValues);
  useEffect(() => {
    defaultValuesRef.current = defaultValues;
  }, [defaultValues]);

  useEffect(() => {
    if (open) {
      form.reset({ addresses: defaultValuesRef.current });
    }
  }, [open, form]);

  const formId = "address_update_form";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogResponsiveContent className="w-full sm:max-w-2xl">
        <DialogStickyHeader>
          <DialogTitle>Update Addresses</DialogTitle>
          <DialogDescription>Add, edit or remove addresses.</DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <AddressField
                control={form.control}
                name="addresses"
                disabled={isPending}
                legend="Addresses"
                addLabel="Add address"
                defaultType={defaultType}
              />
            </FieldGroup>
          </form>
        </DialogResponsiveBody>
        <DialogStickyFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <ButtonSpinner form={formId} isLoading={isPending} type="submit">
            Save
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
