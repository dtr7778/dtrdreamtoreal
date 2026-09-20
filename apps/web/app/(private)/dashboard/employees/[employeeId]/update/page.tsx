import { Metadata } from "next";

import { ArrowLeft } from "lucide-react";
import { createLoader, parseAsString } from "nuqs/server";

import { env } from "@/lib/env";
import { getQueryClient } from "@/lib/tanstack/query/hydration";

import { LinkButton } from "@/components/LinkButton";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellHeader,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { EmployeeUpdateForm } from "@/features/company/components/forms/EmployeeUpdateForm";
import { orpcTQClient } from "@/server/orpc.client";
import { RoutePathType } from "@/types";
import { requireUserPermissionsCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Update company",
};

export default async function CompanyUpdatePage(
  props: PageProps<"/dashboard/employees/[employeeId]/update">
) {
  const { employeeId } = await props.params;

  await requireUserPermissionsCache([
    "system.company_employee.manage",
    "system.company_employee.update",
  ]);

  const { redirectTo } = await createLoader({
    redirectTo: parseAsString.withOptions({ clearOnDefault: true }),
  })(props.searchParams);

  const redirectUrl = new URL(
    redirectTo || `/dashboard/employees/${employeeId}`,
    env.NEXT_PUBLIC_SITE_URL
  );

  const queryclient = getQueryClient();

  await queryclient.query(
    orpcTQClient.company.employee.details.queryOptions({
      input: { employeeId },
    })
  );
  return (
    <DashboardShell
      header={
        <DashboardShellHeader>
          <LinkButton href={redirectUrl.toString() as RoutePathType}>
            <ArrowLeft />
            <span>Go Back</span>
          </LinkButton>
          <DashboardShellTitle>Update Employee</DashboardShellTitle>
          <DashboardShellDescription>
            Update the employee data
          </DashboardShellDescription>
        </DashboardShellHeader>
      }
    >
      <div className="mx-auto max-w-3xl w-full">
        <EmployeeUpdateForm employeeId={employeeId} />
      </div>
    </DashboardShell>
  );
}
