import { Metadata } from "next";

import { ArrowLeft } from "lucide-react";
import { createLoader, parseAsString } from "nuqs/server";

import { env } from "@/lib/env";

import { LinkButton } from "@/components/LinkButton";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellHeader,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { CompanyCreateForm } from "@/features/company/components/forms/CompanyCreateForm";
import { RoutePathType } from "@/types";
import { requireUserPermissionsCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Create new company",
};

export default async function CompanyCreatePage(
  props: PageProps<"/dashboard/companies/create">
) {
  await requireUserPermissionsCache([
    "system.company.manage",
    "system.company.create",
  ]);

  const { redirectTo } = await createLoader({
    redirectTo: parseAsString.withOptions({ clearOnDefault: true }),
  })(props.searchParams);

  const redirectUrl = new URL(
    redirectTo || "/dashboard/companies",
    env.NEXT_PUBLIC_SITE_URL
  );

  return (
    <DashboardShell
      header={
        <DashboardShellHeader>
          <LinkButton href={redirectUrl.toString() as RoutePathType}>
            <ArrowLeft />
            <span>Go Back</span>
          </LinkButton>
          <DashboardShellTitle>Create Company</DashboardShellTitle>
          <DashboardShellDescription>
            Fill those fields to create an new company
          </DashboardShellDescription>
        </DashboardShellHeader>
      }
    >
      <div className="mx-auto max-w-3xl w-full">
        <CompanyCreateForm />
      </div>
    </DashboardShell>
  );
}
