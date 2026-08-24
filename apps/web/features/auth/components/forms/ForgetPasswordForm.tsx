"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import { FieldGroup } from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";

import { authClient } from "@/lib/better-auth/auth-client";

import { RESET_PASSWORD_PATH } from "@/constants";

import { forgetPasswordSchema, ForgetPasswordType } from "../../auth.schema";

export default function ForgetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgetPasswordType>({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (e: ForgetPasswordType) => {
    const toastId = "reset_password_toast_message";

    return await authClient.requestPasswordReset({
      email: e.email,
      redirectTo: RESET_PASSWORD_PATH,
      fetchOptions: {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          toast.success("Reset password email is sent", { id: toastId });
          setIsLoading(false);
          form.reset();
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
        <InputField
          control={form.control}
          name="email"
          type="email"
          placeholder="Email Address"
          label="Email"
          disabled={isLoading}
        />
        <ButtonSpinner
          size="lg"
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          Forget Password
        </ButtonSpinner>
      </FieldGroup>
    </form>
  );
}
