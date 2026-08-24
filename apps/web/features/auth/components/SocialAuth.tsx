"use client";

import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import { Button } from "@workspace/ui/components/button";
import { Portal, PortalBackdrop } from "@workspace/ui/components/portal";
import { Spinner } from "@workspace/ui/components/spinner";

import { authClient } from "@/lib/better-auth/auth-client";

import { GoogleIcon } from "@/assets/icons";
import { ERROR_PAGE_PATH } from "@/constants";
import { formatApiError } from "@/utils/formatApiError";

export default function SocialAuth({
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

  useEffect(() => {
    (async () => {
      try {
        const toastId = "google_one_login_toast_message";
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        await authClient.oneTap({
          callbackURL: redirectURL,
          fetchOptions: {
            onRequest: () => {
              setIsLoading(true);
            },
            onSuccess: () => {
              setIsLoading(false);
              authClient
                .updateUser({
                  timezone,
                })
                .catch((err) => {
                  const { message } = formatApiError(err);
                  toast.error(message, { id: toastId });
                });
            },
            onError: ({ error }) => {
              toast.error(error.message, { id: toastId });
              setIsLoading(false);
            },
          },
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error in OneTap Login"
        );
      }
    })();
  }, [redirectURL]);

  const handleGoogleLogin = async () => {
    const toastId = "google_login_toast_message";
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    authClient.signIn.social({
      provider: "google",
      callbackURL: redirectURL,
      newUserCallbackURL: redirectURL,
      errorCallbackURL: ERROR_PAGE_PATH,
      fetchOptions: {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          setIsLoading(false);
          authClient
            .updateUser({
              timezone,
            })
            .catch((err) => {
              const { message } = formatApiError(err);
              toast.error(message, { id: toastId });
            });
        },
        onError: ({ error }) => {
          toast.error(error.message, { id: toastId });
          setIsLoading(false);
        },
      },
    });
  };

  return (
    <>
      <div className="flex w-full flex-col items-center justify-center gap-4">
        <Button
          onClick={handleGoogleLogin}
          variant="outline"
          className="w-full"
          size="lg"
          disabled={isLoading}
          aria-disabled={isLoading}
        >
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <GoogleIcon />
              <span>Login with Google</span>
            </>
          )}
        </Button>
      </div>
      {isLoading && (
        <Portal>
          <PortalBackdrop />
          <div className="flex h-svh w-full items-center justify-center">
            <Spinner size={50} />
          </div>
        </Portal>
      )}
    </>
  );
}
