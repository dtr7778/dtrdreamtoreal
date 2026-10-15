import { useState } from "react";

import { useFileUploadState } from "#/components/FileUpload";
import { FileUploadField } from "#/components/form-fields/FileUploadField";
import { UserSelectorField } from "#/features/user/components/UserSelectorField";
import { orpcTQClient } from "#/server/orpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
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
import { Skeleton } from "@workspace/ui/components/skeleton";
import { QueryStateBoundary } from "@workspace/ui/components/tanstack-query/query-state-boundary";

import { useUpdateGroup } from "../../api/chat.api.hook";
import type { RoomDetailsContractType } from "../../api/chat.contract";
import { updateGroupSchema } from "../../chat.schema";
import type { UpdateGroupType } from "../../chat.schema";

export function ChatGroupUpdateDialog({
  roomId,
  open,
  onOpenChange,
}: {
  roomId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  "use no memo";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.chat.roomDetails.queryOptions({
      input: { roomId },
      enabled: open,
      select: (result) => result.data,
    })
  );

  const formId = "chat_group_update_form";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogResponsiveContent className="w-full sm:max-w-xl">
        <DialogStickyHeader>
          <DialogTitle>Edit conversation</DialogTitle>
          <DialogDescription>Update the group details.</DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <QueryStateBoundary
            data={data}
            isLoading={isLoading}
            isError={isError}
            error={error}
            isEmpty={() => false}
            loadingFallback={
              <div className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            }
          >
            {(roomDetails) => (
              <ChatGroupUpdateForm
                formId={formId}
                details={roomDetails}
                onSuccess={() => onOpenChange(false)}
                onRequestStart={() => setIsSubmitting(true)}
                onRequestEnd={() => setIsSubmitting(false)}
              />
            )}
          </QueryStateBoundary>
        </DialogResponsiveBody>
        <DialogStickyFooter>
          <div className="flex justify-end gap-2">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                />
              }
            >
              Cancel
            </DialogClose>
            <ButtonSpinner form={formId} type="submit" isLoading={isSubmitting}>
              Save changes
            </ButtonSpinner>
          </div>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}

function ChatGroupUpdateForm({
  formId,
  details,
  onSuccess,
  onRequestStart,
  onRequestEnd,
}: {
  formId: string;
  details: RoomDetailsContractType["output"]["data"];
  onSuccess: () => void;
  onRequestStart: () => void;
  onRequestEnd: () => void;
}) {
  "use no memo";
  const {
    fileValue,
    setFileValue,
    fileError,
    setFileError,
    uploadingProgress,
    setUploadingProgress,
    uploadRef,
  } = useFileUploadState();

  const form = useForm<UpdateGroupType>({
    resolver: zodResolver(updateGroupSchema),
    values: {
      roomId: details.id,
      name: details.name ?? details.displayName,
      memberIds: details.members.map(({ userId }) => userId),
    },
  });

  const { mutate, isPending } = useUpdateGroup<keyof UpdateGroupType>({
    uploadRef,
    onProgress: setUploadingProgress,
    onSuccess,
    onRequestStart,
    onRequestEnd,
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, { message });
      });
    },
  });

  const handleSubmit = form.handleSubmit(async (value) => {
    mutate({
      ...value,
      imageFile: fileValue instanceof File ? fileValue : null,
    });
  });

  return (
    <form id={formId} onSubmit={handleSubmit}>
      <FieldGroup>
        <FileUploadField
          label="Group image"
          variant="image"
          uploadingProgress={uploadingProgress}
          value={details.image ?? undefined}
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
          label="Name"
          placeholder="Group name"
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
          fetchApi={true}
        />
      </FieldGroup>
    </form>
  );
}
