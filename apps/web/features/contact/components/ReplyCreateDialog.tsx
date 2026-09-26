"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@workspace/ui/components/button";
import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import {
  Dialog,
  DialogClose,
  DialogResponsiveBody,
  DialogResponsiveContent,
  DialogStickyFooter,
  DialogStickyHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { FieldGroup } from "@workspace/ui/components/field";
import { TextareaField } from "@workspace/ui/components/form-fields/TextareaField";

import { useContactReplyCreate } from "../api/contact.api.hook";
import { createReplySchema, CreateReplyType } from "../contact.schema";

export function ReplyCreateDialog({
  contactId,
  disabled,
}: {
  contactId: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const form = useForm<CreateReplyType>({
    resolver: zodResolver(createReplySchema),
    defaultValues: {
      reply: "",
    },
    disabled,
  });

  const { mutate, isPending } = useContactReplyCreate({
    onSuccess: () => {
      form.reset();
      setOpen(false);
    },
  });

  const handleSubmit = (data: CreateReplyType) => {
    mutate({
      contactId,
      reply: data.reply,
    });
  };

  const formId = "contactReplyForm";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button disabled={disabled} />}>
        Add Reply
      </DialogTrigger>
      <DialogResponsiveContent>
        <DialogStickyHeader>
          <DialogTitle>Create Reply</DialogTitle>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <form id={formId} onSubmit={form.handleSubmit(handleSubmit)}>
            <FieldGroup>
              <TextareaField
                control={form.control}
                name="reply"
                label="Content"
                requiredField
              />
            </FieldGroup>
          </form>
        </DialogResponsiveBody>
        <DialogStickyFooter>
          <DialogClose render={<Button variant="secondary" />}>
            Cancel
          </DialogClose>
          <ButtonSpinner form={formId} isLoading={isPending} type="submit">
            Submit
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
