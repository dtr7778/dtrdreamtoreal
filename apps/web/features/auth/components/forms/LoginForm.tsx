"use client";

import Link from "next/link";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { Button } from "@workspace/ui/components/button";
import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { PasswordInput } from "@workspace/ui/components/password-input";

import { authClient } from "@/lib/better-auth/auth-client";

import { loginSchema, LoginType } from "../../auth.schema";
import RememberMe from "../RememberMe";

export default function LoginForm({
  redirect,
  invitationId,
}: {
  redirect: string;
  invitationId?: string | undefined;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const redirectURL = invitationId
    ? `/accept-invitation?invitationId=${invitationId}`
    : redirect;

  const form = useForm<LoginType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const handleSubmit = async (e: LoginType) => {
    const toastId = "login_toast_message";

    return await authClient.signIn.email(
      {
        email: e.email,
        password: e.password,
        callbackURL: redirectURL,
        rememberMe: e.rememberMe,
      },
      {
        onRequest: () => {
          toast.loading("Logging in...", { id: toastId });
          setIsLoading(true);
        },
        onSuccess: async () => {
          toast.success("Login Successfully", { id: toastId });
          setIsLoading(false);
          form.reset();
        },
        onError: ({ error }) => {
          if (error?.code === "EMAIL_NOT_VERIFIED") {
            // const email = form.getValues().email;

            toast(
              () => (
                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="font-semibold">
                      Your email is not verified
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Click this button to resend email verification mail
                    </div>
                  </div>
                  <Button
                    onClick={async () => {
                      toast.dismiss(toastId);

                      await authClient.sendVerificationEmail({
                        email: e.email,
                        callbackURL: redirect,
                        fetchOptions: {
                          onRequest: () => {
                            toast.loading("Resending email...", {
                              id: toastId,
                            });
                            setIsLoading(true);
                          },
                          onSuccess: () => {
                            toast.success("Email is sent", { id: toastId });
                            setIsLoading(false);
                            form.reset();
                          },
                          onError: ({ error }) => {
                            toast.error(
                              error.message ?? "Something went wrong!",
                              {
                                id: toastId,
                              }
                            );
                            setIsLoading(false);
                            form.reset();
                          },
                        },
                      });
                    }}
                    size="sm"
                    variant="secondary"
                  >
                    Resend
                  </Button>
                </div>
              ),
              {
                id: toastId,
                duration: 5000,
              }
            );
          } else {
            toast.error(error.message ?? "Something went wrong!", {
              id: toastId,
            });
          }
          setIsLoading(false);
          form.reset();
        },
      }
    );
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <InputField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          placeholder="Email Address"
          disabled={isLoading}
          requiredField
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center gap-2">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <span className="text-destructive">*</span>
                <Link
                  href={{ pathname: "/forget-password" }}
                  className="link ml-auto text-sm"
                >
                  Forget password?
                </Link>
              </div>
              <PasswordInput
                {...field}
                id="password"
                placeholder="Password"
                disabled={isLoading}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <RememberMe
          control={form.control}
          name="rememberMe"
          disabled={isLoading}
        />
        <ButtonSpinner
          size="lg"
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          Login
        </ButtonSpinner>
      </FieldGroup>
    </form>
  );
}
