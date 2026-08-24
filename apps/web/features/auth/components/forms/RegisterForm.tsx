"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import { FieldGroup } from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { PasswordInputField } from "@workspace/ui/components/form-fields/PasswordInputField";

import { authClient } from "@/lib/better-auth/auth-client";

import { registerSchema, RegisterType } from "../../auth.schema";

export default function RegisterForm({
  redirect,
  invitationId,
  email,
}: {
  redirect: string;
  invitationId?: string | undefined;
  email?: string | undefined;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const redirectURL = invitationId
    ? `/organization/accept-invitation?invitationId=${invitationId}`
    : redirect;

  const form = useForm<RegisterType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: email ?? "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (e: RegisterType) => {
    const toastId = "register_toast_message";

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return await authClient.signUp.email({
      email: e.email,
      name: e.name,
      password: e.password,
      callbackURL: redirectURL,
      timezone,
      fetchOptions: {
        onRequest: () => {
          toast.loading("Registering...", { id: toastId });
          setIsLoading(true);
        },
        onSuccess: () => {
          toast.success("Registration Successfully", { id: toastId });
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
          name="name"
          label="Full name"
          placeholder="Full name"
          disabled={isLoading}
          requiredField
        />
        {!email && (
          <InputField
            control={form.control}
            name="email"
            label="Email"
            placeholder="Email Password"
            disabled={isLoading}
            requiredField
          />
        )}
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
          Register
        </ButtonSpinner>
      </FieldGroup>
    </form>
  );
}
