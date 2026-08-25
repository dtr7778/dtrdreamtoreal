"use client";

import { useRouter } from "next/navigation";
import { ComponentProps, ElementType, useCallback, useState } from "react";

import { Plus, Shield, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import { Card, CardContent } from "@workspace/ui/components/card";

import { auth } from "@/lib/better-auth/auth";
import { authClient } from "@/lib/better-auth/auth-client";

import { GoogleIcon } from "@/assets/icons";
import { DEFAULT_AUTH_PATH, SUPPORTED_OAUTH_PROVIDERS } from "@/constants";

type Account = Awaited<ReturnType<typeof auth.api.listUserAccounts>>[number];

export default function LinkingApps({
  currentAccounts,
}: {
  currentAccounts: Account[];
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Linked Accounts</h3>

        {currentAccounts.length === 0 ? (
          <Card>
            <CardContent className="text-secondary-muted py-8 text-center">
              No linked accounts found
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {currentAccounts.map((account) => (
              <AccountCard
                key={account.id}
                provider={account.providerId}
                account={account}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Link Other Accounts</h3>
        <div className="grid gap-3">
          {SUPPORTED_OAUTH_PROVIDERS.filter(
            (provider) =>
              !currentAccounts.find((acc) => acc.providerId === provider)
          ).map((provider) => (
            <AccountCard key={provider} provider={provider} />
          ))}
        </div>
      </div>
    </div>
  );
}

type SupportedOAuthProvider = (typeof SUPPORTED_OAUTH_PROVIDERS)[number];

const SUPPORTED_OAUTH_PROVIDER_DETAILS: Record<
  SupportedOAuthProvider,
  { name: string; Icon: ElementType<ComponentProps<"svg">> }
> = {
  google: { name: "Google", Icon: GoogleIcon },
};

function AccountCard({
  provider,
  account,
}: {
  provider: string;
  account?: Account;
}) {
  const providerDetails = SUPPORTED_OAUTH_PROVIDER_DETAILS[
    provider as SupportedOAuthProvider
  ] ?? {
    name: provider,
    Icon: Shield,
  };

  const { linkAccount, unlinkAccount, isLoading } = useLinkUnLinkAccount(
    provider,
    account
  );

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {<providerDetails.Icon className="size-5" />}
            <div>
              <p className="font-medium">{providerDetails.name}</p>
              {account ? (
                <p className="text-sm text-muted-foreground">
                  Linked on {new Date(account.createdAt).toLocaleDateString()}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Connect your {providerDetails.name} account for easier sign-in
                </p>
              )}
            </div>
          </div>
          {account ? (
            <ButtonSpinner
              isLoading={isLoading}
              variant="destructive"
              size="sm"
              onClick={unlinkAccount}
            >
              <Trash2 />
              <span>Unlink</span>
            </ButtonSpinner>
          ) : (
            <ButtonSpinner
              isLoading={isLoading}
              variant="outline"
              size="sm"
              onClick={linkAccount}
            >
              <Plus />
              <span>Link</span>
            </ButtonSpinner>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function useLinkUnLinkAccount(provider: string, account?: Account) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const linkAccount = useCallback(() => {
    const toastId = "link_account_toast_message";

    return authClient.linkSocial({
      provider,
      callbackURL: DEFAULT_AUTH_PATH,
      fetchOptions: {
        onRequest: () => {
          setIsLoading(true);
          toast.loading("Linking account...", {
            id: toastId,
          });
        },
        onSuccess: () => {
          setIsLoading(false);
          toast.success("Account linked", { id: toastId });
          router.refresh();
        },
        onError: ({ error }) => {
          setIsLoading(false);
          toast.error(error.message, { id: toastId });
        },
      },
    });
  }, [router, provider]);

  const unlinkAccount = useCallback(() => {
    const toastId = "unlink_account_toast_message";

    if (!account) {
      toast.error("Account not found", { id: toastId });
      return;
    }

    return authClient.unlinkAccount(
      {
        accountId: account.accountId,
        providerId: provider,
      },
      {
        onRequest: () => {
          setIsLoading(true);
          toast.loading("Unlinking account...", {
            id: toastId,
          });
        },
        onSuccess: () => {
          setIsLoading(false);
          toast.success("Account unlinked", { id: toastId });
          router.refresh();
        },
        onError: ({ error }) => {
          setIsLoading(false);
          toast.error(error.message, { id: toastId });
        },
      }
    );
  }, [router, account, provider]);

  return { linkAccount, unlinkAccount, isLoading };
}
