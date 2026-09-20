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

import { CompanyManagementTable } from "@/features/company/components/company-table/CompanyManagementTable";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Company management",
};

export default async function CompaniesPage(
  props: PageProps<"/dashboard/companies">
) {
  await requireUserPermissionsCache([
    "system.company.manage",
    "system.company.list",
  ]);

  const filters = await tableQuerySearchParams({
    ...createRangeFilterServer(),
  })(props.searchParams);

  const searchFields = ["name", "email"];

  const queryclient = getQueryClient();

  await queryclient.query(
    orpcTQClient.company.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields,
        order: filters.order ?? "desc",
        orderField: filters.orderField ?? "createdAt",
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
            <DashboardShellTitle>Company Management</DashboardShellTitle>
            <DashboardShellDescription>
              Manage all companies
            </DashboardShellDescription>
          </DashboardShellHeader>
        }
      >
        <CompanyManagementTable searchFields={searchFields} />
      </DashboardShell>
    </HydrateClient>
  );
}
