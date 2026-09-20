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

import { EmployeeCreateForm } from "@/features/company/components/forms/EmployeeCreateForm";
import { RoutePathType } from "@/types";
import { requireUserPermissionsCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Create new employee",
};

export default async function EmployeeCreatePage(
  props: PageProps<"/dashboard/employees/create">
) {
  await requireUserPermissionsCache([
    "system.company_employee.manage",
    "system.company_employee.create",
  ]);

  const { redirectTo, companyId } = await createLoader({
    redirectTo: parseAsString.withOptions({ clearOnDefault: true }),
    companyId: parseAsString.withOptions({ clearOnDefault: true }),
  })(props.searchParams);

  const redirectUrl = new URL(
    redirectTo || "/dashboard/employees",
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
          <DashboardShellTitle>Create employee</DashboardShellTitle>
          <DashboardShellDescription>
            Fill those fields to create an new employee
          </DashboardShellDescription>
        </DashboardShellHeader>
      }
    >
      <div className="mx-auto max-w-3xl w-full">
        <EmployeeCreateForm companyId={companyId} />
      </div>
    </DashboardShell>
  );
}
