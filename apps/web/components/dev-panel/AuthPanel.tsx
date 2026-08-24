"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import toast from "react-hot-toast";

import { ButtonSpinner } from "@workspace/ui/components/button-spinner";

import { authClient } from "@/lib/better-auth/auth-client";

import type { RoutePathType } from "@/types";

import { useDevPanelContext } from "./DevPanelContext";

export function AuthPanel() {
  const toastId = "dev_login_toast_message";
  const [isLoading, setIsLoading] = useState(false);
  const { redirectUrl } = useDevPanelContext();
  const router = useRouter();

  const handleLogout = async (isRedirect: boolean = false) => {
    return await authClient.signOut({
      fetchOptions: {
        onRequest: () => {
          toast.loading("Logging out...", { id: toastId });
          setIsLoading(true);
        },
        onSuccess: () => {
          toast.success("Logged out successfully", {
            id: toastId,
          });
          setIsLoading(false);
          if (isRedirect) {
            router.push(redirectUrl as RoutePathType);
          }
        },
        onError: () => {
          toast.error("Failed to log out. Please try again", {
            id: toastId,
          });
          setIsLoading(false);
        },
      },
    });
  };

  const handleLogin = async (email: string) => {
    await handleLogout();
    return await authClient.signIn.email(
      {
        email: email,
        password: "12345678",
        callbackURL: redirectUrl,
      },
      {
        onRequest: () => {
          toast.loading("Logging in...", { id: toastId });
          setIsLoading(true);
        },
        onSuccess: async () => {
          toast.success("Login Successfully", { id: toastId });
          setIsLoading(false);
        },
        onError: ({ error }) => {
          toast.error(error.message ?? "Something went wrong!", {
            id: toastId,
          });
          setIsLoading(false);
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-2 p-2">
      <ButtonSpinner
        onClick={() => handleLogin("superadmin@mail.com")}
        isLoading={isLoading}
      >
        Super Admin Login
      </ButtonSpinner>
      <ButtonSpinner
        onClick={() => handleLogin("admin@mail.com")}
        isLoading={isLoading}
      >
        Admin Login
      </ButtonSpinner>
      <ButtonSpinner
        onClick={() => handleLogin("support.agent@mail.com")}
        isLoading={isLoading}
      >
        Support agent Login
      </ButtonSpinner>
      <ButtonSpinner
        onClick={() => handleLogin("user@mail.com")}
        isLoading={isLoading}
      >
        User Login
      </ButtonSpinner>
      <ButtonSpinner
        onClick={() => handleLogout(true)}
        variant="destructive"
        isLoading={isLoading}
      >
        Logout
      </ButtonSpinner>
    </div>
  );
}
