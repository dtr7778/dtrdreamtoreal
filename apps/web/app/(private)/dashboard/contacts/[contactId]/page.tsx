import { Metadata } from "next";

import { ArrowLeft } from "lucide-react";

import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { LinkButton } from "@/components/LinkButton";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { DashboardShellHeader } from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { ContactDetails } from "@/features/contact/components/ContactDetails";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Contact Details",
};

export default async function ContactDetailsPage(
  props: PageProps<"/dashboard/contacts/[contactId]">
) {
  const { contactId } = await props.params;

  await requireUserPermissionsCache([
    "system.contact.manage",
    "system.contact.read",
  ]);

  const queryclient = getQueryClient();

  await queryclient.query(
    orpcTQClient.contact.details.queryOptions({
      input: {
        contactId,
      },
    })
  );

  return (
    <HydrateClient client={queryclient}>
      <DashboardShell
        className="max-w-5xl w-full mx-auto"
        header={
          <DashboardShellHeader>
            <LinkButton href="/dashboard/contacts">
              <ArrowLeft />
              <span>Go Back</span>
            </LinkButton>
          </DashboardShellHeader>
        }
      >
        <ContactDetails contactId={contactId} />
      </DashboardShell>
    </HydrateClient>
  );
}
