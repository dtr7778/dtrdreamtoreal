"use client";

import { useEffect, useRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

import { SocialMediaTypeEnumType } from "@workspace/drizzle/zod-db-enums";
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

import {
  socialMediaCreateSchema,
  SocialMediaCreateType,
} from "../../company.schema";
import { SocialMediaField } from "../forms/SocialMediaField";

const socialMediaUpdateFormSchema = z.object({
  socialMedia: z.array(socialMediaCreateSchema),
});

export type SocialMediaUpdateFormType = z.infer<
  typeof socialMediaUpdateFormSchema
>;

interface SocialMediaUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues: SocialMediaCreateType[];
  defaultType: SocialMediaTypeEnumType;
  onSubmit: (values: SocialMediaUpdateFormType) => void;
  isPending?: boolean;
}

export function SocialMediaUpdateDialog({
  open,
  onOpenChange,
  defaultValues,
  defaultType,
  onSubmit,
  isPending = false,
}: SocialMediaUpdateDialogProps) {
  "use no memo";
  const form = useForm<SocialMediaUpdateFormType>({
    resolver: zodResolver(socialMediaUpdateFormSchema),
    defaultValues: { socialMedia: defaultValues },
  });

  const defaultValuesRef = useRef(defaultValues);
  useEffect(() => {
    defaultValuesRef.current = defaultValues;
  }, [defaultValues]);

  useEffect(() => {
    if (open) {
      form.reset({ socialMedia: defaultValuesRef.current });
    }
  }, [open, form]);

  const formId = "social_media_update_form";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogResponsiveContent className="w-full sm:max-w-2xl">
        <DialogStickyHeader>
          <DialogTitle>Update Social Media</DialogTitle>
          <DialogDescription>
            Add, edit or remove social media profiles.
          </DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <SocialMediaField
                control={form.control}
                name="socialMedia"
                disabled={isPending}
                legend="Social media"
                addLabel="Add social media"
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
