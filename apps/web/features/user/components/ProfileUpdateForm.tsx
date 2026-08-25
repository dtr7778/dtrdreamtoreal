"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import { FieldGroup } from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";

import { useFileUploadState } from "@/components/FileUpload";
import { FileUploadField } from "@/components/form-fields/FileUploadField";

import { useAuthStore } from "@/stores/zustand/auth/AuthStoreContext";

import { useProfileUpdate } from "../api/users.api.hook";
import { profileUpdateSchema, ProfileUpdateType } from "../user.schema";

export function ProfileUpdateForm() {
  "use no memo";
  const user = useAuthStore((state) => state.user!);

  const {
    fileValue,
    setFileValue,
    fileError,
    setFileError,
    uploadingProgress,
    setUploadingProgress,
    uploadRef,
  } = useFileUploadState();

  const form = useForm<ProfileUpdateType>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  const { mutateAsync, isPending } = useProfileUpdate<keyof ProfileUpdateType>({
    uploadRef,
    onProgress: setUploadingProgress,
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, {
          message,
        });
      });
    },
  });

  const handleSubmit = async (e: ProfileUpdateType) => {
    mutateAsync({
      ...e,
      profileImage: fileValue,
    });
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <FileUploadField
          label="Profile image"
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
          label="Name"
          placeholder="Name"
          disabled={isPending}
        />
        <InputField
          control={form.control}
          name="email"
          type="email"
          label="Email address"
          placeholder="Email Address"
          description="you can't update your email address."
          disabled
        />
        <ButtonSpinner className="w-fit" type="submit" isLoading={isPending}>
          Submit
        </ButtonSpinner>
      </FieldGroup>
    </form>
  );
}
