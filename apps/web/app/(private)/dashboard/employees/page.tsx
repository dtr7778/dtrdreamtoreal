import { Metadata } from "next";

import { createRangeFilterServer } from "@/lib/nuqs/rangeFilter.server";
import { tableQuerySearchParams } from "@/lib/nuqs/tableQuerySearchParams";
import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellHeader,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { EmployeeManagementTable } from "@/features/company/components/employee-table/EmployeeManagementTable";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Employee management",
};

export default async function EmployeesPage(
  props: PageProps<"/dashboard/employees">
) {
  await requireUserPermissionsCache([
    "system.company_employee.manage",
    "system.company_employee.list",
  ]);

  const filters = await tableQuerySearchParams({
    ...createRangeFilterServer(),
  })(props.searchParams);

  const searchFields = ["firstName", "lastName", "email"];

  const queryclient = getQueryClient();

  await queryclient.query(
    orpcTQClient.company.employee.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields,
        order: filters.order ?? undefined,
        orderField: filters.orderField ?? undefined,
        filter: {
          createdAt:
            filters.startTime && filters.endTime
              ? { from: filters.startTime, to: filters.endTime }
              : undefined,
        },
      },
    })
  );

  return (
    <HydrateClient client={queryclient}>
      <DashboardShell
        header={
          <DashboardShellHeader>
            <DashboardShellTitle>Employee Management</DashboardShellTitle>
            <DashboardShellDescription>
              Manage your employees
            </DashboardShellDescription>
          </DashboardShellHeader>
        }
      >
        <EmployeeManagementTable searchFields={searchFields} />
      </DashboardShell>
    </HydrateClient>
  );
}
