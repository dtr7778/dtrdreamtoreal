import { Metadata } from "next";

import { tableQuerySearchParams } from "@/lib/nuqs/tableQuerySearchParams";
import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellHeader,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { UserManagementTable } from "@/features/user/components/user-table/UserManagementTable";
import { UserStats } from "@/features/user/components/UserStats";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "User management",
};

export default async function UsersPage(props: PageProps<"/dashboard/users">) {
  await requireUserPermissionsCache(["system.user.manage", "system.user.list"]);

  const filters = await tableQuerySearchParams({})(props.searchParams);

  const searchFields = ["name", "email"];

  const queryclient = getQueryClient();

  await queryclient.query(
    orpcTQClient.user.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields,
        order: filters.order ?? undefined,
        orderField: filters.orderField ?? undefined,
      },
    })
  );

  await queryclient.prefetchQuery(orpcTQClient.user.stats.queryOptions());

  return (
    <HydrateClient client={queryclient}>
      <DashboardShell
        header={
          <DashboardShellHeader>
            <DashboardShellTitle>User Management</DashboardShellTitle>
            <DashboardShellDescription>
              Manage your users
            </DashboardShellDescription>
          </DashboardShellHeader>
        }
      >
        <UserStats />
        <UserManagementTable searchFields={searchFields} />
      </DashboardShell>
    </HydrateClient>
  );
}
