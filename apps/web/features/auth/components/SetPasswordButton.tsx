"use client";

import { ButtonProps } from "@workspace/ui/components/button";
import { ButtonSpinner } from "@workspace/ui/components/button-spinner";

import { useAuthStore } from "@/stores/zustand/auth/AuthStoreContext";

import { useRequestPasswordReset } from "../api/auth.api.hook";

export default function SetPasswordButton({
  variant = "outline",
  ...props
}: ButtonProps) {
  const user = useAuthStore((state) => state.user!);

  const { mutate, isPending } = useRequestPasswordReset();

  return (
    <ButtonSpinner
      isLoading={isPending}
      variant={variant}
      onClick={() => mutate({ email: user.email })}
      {...props}
    >
      Send Password Reset Email
    </ButtonSpinner>
  );
}
