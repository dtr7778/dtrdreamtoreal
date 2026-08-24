"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field";
import { PasswordInputField } from "@workspace/ui/components/form-fields/PasswordInputField";

import { authClient } from "@/lib/better-auth/auth-client";

import { updatePasswordSchema, UpdatePasswordType } from "../../auth.schema";

export default function UpdatePasswordForm() {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const form = useForm<UpdatePasswordType>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      revokeOtherSessions: false,
    },
  });

  const handleSubmit = async (e: UpdatePasswordType) => {
    const toastId = "update_password_toast_message";

    return authClient.changePassword({
      newPassword: e.newPassword,
      currentPassword: e.currentPassword,
      revokeOtherSessions: e.revokeOtherSessions,
      fetchOptions: {
        onRequest: () => {
          setIsLoading(true);
          toast.loading("Updating password...", {
            id: toastId,
          });
        },
        onSuccess: () => {
          setIsLoading(false);
          toast.success("Password updated", { id: toastId });
          form.reset();
          router.refresh();
        },
        onError: ({ error }) => {
          setIsLoading(false);
          toast.error(error.message, { id: toastId });
          form.reset();
        },
      },
    });
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <PasswordInputField
          control={form.control}
          name="currentPassword"
          label="Current Password"
          placeholder="********"
          requiredField
          disabled={isLoading}
        />
        <PasswordInputField
          control={form.control}
          name="newPassword"
          label="New Password"
          placeholder="********"
          requiredField
          disabled={isLoading}
        />
        <PasswordInputField
          control={form.control}
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm Password"
          disabled={isLoading}
          requiredField
        />
        <Controller
          control={form.control}
          name="revokeOtherSessions"
          render={({ field }) => (
            <Field orientation="horizontal" aria-disabled={isLoading}>
              <Checkbox
                id="revokeOtherSessions"
                className="size-4 rounded"
                name={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isLoading}
              />
              <FieldLabel
                htmlFor="revokeOtherSessions"
                className="font-normal"
                aria-disabled={isLoading}
              >
                Lot out other sessions
              </FieldLabel>
            </Field>
          )}
        />
        <ButtonSpinner className="w-fit" type="submit" isLoading={isLoading}>
          Submit
        </ButtonSpinner>
      </FieldGroup>
    </form>
  );
}
