import { Metadata } from "next";

import { ArrowLeft } from "lucide-react";

import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { LinkButton } from "@/components/LinkButton";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { DashboardShellHeader } from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { CompanyDetails } from "@/features/company/components/company-details";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Company Details",
};

export default async function CompanyDetailsPage(
  props: PageProps<"/dashboard/companies/[companyId]">
) {
  const { companyId } = await props.params;
  await requireUserPermissionsCache([
    "system.company.manage",
    "system.company.read",
  ]);

  const queryclient = getQueryClient();

  await queryclient.query(
    orpcTQClient.company.details.queryOptions({
      input: { companyId },
    })
  );

  return (
    <HydrateClient client={queryclient}>
      <DashboardShell
        className="mx-auto w-full max-w-5xl"
        header={
          <DashboardShellHeader>
            <LinkButton href="/dashboard/companies">
              <ArrowLeft />
              <span>Go Back</span>
            </LinkButton>
          </DashboardShellHeader>
        }
      >
        <CompanyDetails companyId={companyId} />
      </DashboardShell>
    </HydrateClient>
  );
}
