import { useCallback } from "react";

import { useFileUploadState } from "#/components/FileUpload";
import { FileUploadField } from "#/components/form-fields/FileUploadField";
import { UserSelectorField } from "#/features/user/components/UserSelectorField";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
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

import { useCreateGroup } from "../../api/chat.api.hook.js";
import { createGroupSchema } from "../../chat.schema.js";
import type { CreateGroupType } from "../../chat.schema.js";

export function ChatGroupCreateDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  "use no memo";
  const navigate = useNavigate();

  const {
    fileValue,
    setFileValue,
    fileError,
    setFileError,
    uploadingProgress,
    setUploadingProgress,
    uploadRef,
  } = useFileUploadState();

  const form = useForm<CreateGroupType>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: { name: "", memberIds: [] },
  });

  const { mutate, isPending } = useCreateGroup<keyof CreateGroupType>({
    uploadRef,
    onProgress: setUploadingProgress,
    onSuccess: () => {
      setOpen(false);
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, { message });
      });
    },
  });

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (!next) {
        setFileValue(null);
        form.reset({ name: "", memberIds: [] });
      }
    },
    [form, setFileValue]
  );

  const handleSubmit = form.handleSubmit((values) => {
    mutate(
      {
        name: values.name,
        memberIds: values.memberIds,
        imageFile: fileValue instanceof File ? fileValue : null,
      },
      {
        onSuccess: ({ data }) => {
          void navigate({
            to: "/chat/$chatRoomId",
            params: { chatRoomId: data.id },
          });
        },
      }
    );
  });

  const formId = "chat_group_create_from";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogResponsiveContent className="w-full sm:max-w-xl">
        <DialogStickyHeader>
          <DialogTitle>New group</DialogTitle>
          <DialogDescription>
            Name your group and add at least 1 members.
          </DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <form id={formId} onSubmit={handleSubmit}>
            <FieldGroup>
              <FileUploadField
                label="Group image"
                variant="image"
                uploadingProgress={uploadingProgress}
                value={fileValue}
                onChange={setFileValue}
                ref={uploadRef}
                disabled={isPending}
                fieldError={fileError}
                onError={setFileError}
              />
              <InputField
                control={form.control}
                name="name"
                type="text"
                label="Group name"
                placeholder="e.g. Marketing team"
                requiredField
                disabled={isPending}
              />

              <UserSelectorField
                name="memberIds"
                control={form.control}
                label="Members"
                requiredField
                multiple
                disabled={isPending}
                fetchApi={open}
              />
            </FieldGroup>
          </form>
        </DialogResponsiveBody>
        <DialogStickyFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline" disabled={isPending} />
            }
          >
            Cancel
          </DialogClose>
          <ButtonSpinner form={formId} type="submit" isLoading={isPending}>
            Create group
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
