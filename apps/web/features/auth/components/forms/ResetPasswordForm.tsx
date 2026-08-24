"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import { FieldGroup } from "@workspace/ui/components/field";
import { PasswordInputField } from "@workspace/ui/components/form-fields/PasswordInputField";

import { authClient } from "@/lib/better-auth/auth-client";

import { DEFAULT_UNAUTH_PATH } from "@/constants";

import { resetPasswordSchema, ResetPasswordType } from "../../auth.schema";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<ResetPasswordType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (e: ResetPasswordType) => {
    const toastId = "reset_password_toast_message";

    return await authClient.resetPassword({
      newPassword: e.password,
      token,
      fetchOptions: {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          toast.success("Password is changed", { id: toastId });
          setIsLoading(false);
          form.reset();
          router.push(DEFAULT_UNAUTH_PATH);
        },
        onError: ({ error }) => {
          toast.error(error.message ?? "Something went wrong!", {
            id: toastId,
          });
          setIsLoading(false);
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
          name="password"
          label="Password"
          placeholder="Password"
          disabled={isLoading}
          requiredField
        />
        <PasswordInputField
          control={form.control}
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm Password"
          disabled={isLoading}
          requiredField
        />
        <ButtonSpinner
          size="lg"
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          Submit
        </ButtonSpinner>
      </FieldGroup>
    </form>
  );
}
