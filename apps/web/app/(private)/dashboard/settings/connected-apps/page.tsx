import { Metadata } from "next";
import { headers } from "next/headers";

import { auth } from "@/lib/better-auth/auth";

import LinkingApps from "@/features/auth/components/LinkingApps";

export const metadata: Metadata = {
  title: "Connected apps",
};

export default async function ConnectedAppsPage() {
  const accounts = await auth.api.listUserAccounts({
    headers: await headers(),
  });

  const nonCredentialAccounts = accounts.filter(
    (a) => a.providerId !== "credential"
  );
  return (
    <div>
      <h2 className="mb-2 text-2xl font-semibold">Connected apps</h2>
      <LinkingApps currentAccounts={nonCredentialAccounts} />
    </div>
  );
}
