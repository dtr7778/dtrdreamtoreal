import { Metadata } from "next";

import { ArrowLeft } from "lucide-react";

import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { LinkButton } from "@/components/LinkButton";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { DashboardShellHeader } from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { EmployeeDetails } from "@/features/company/components/employee-details";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Employee Details",
};

export default async function EmployeeDetailsPage(
  props: PageProps<"/dashboard/employees/[employeeId]">
) {
  const { employeeId } = await props.params;

  await requireUserPermissionsCache([
    "system.company_employee.manage",
    "system.company_employee.read",
  ]);

  const queryclient = getQueryClient();

  await queryclient.query(
    orpcTQClient.company.employee.details.queryOptions({
      input: { employeeId },
    })
  );

  return (
    <HydrateClient client={queryclient}>
      <DashboardShell
        className="mx-auto w-full max-w-5xl"
        header={
          <DashboardShellHeader>
            <LinkButton href="/dashboard/employees">
              <ArrowLeft />
              <span>Go Back</span>
            </LinkButton>
          </DashboardShellHeader>
        }
      >
        <EmployeeDetails employeeId={employeeId} />
      </DashboardShell>
    </HydrateClient>
  );
}
