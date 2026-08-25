import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellHeader,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { RoleManagementTable } from "@/features/role/components/role-table/RoleManagementTable";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsCache } from "@/utils/user-utils";

export default async function RolesPage() {
  await requireUserPermissionsCache(["system.role-permission.list"]);
  const queryClient = getQueryClient();

  await queryClient.query(orpcTQClient.role.listRole.queryOptions());

  return (
    <HydrateClient client={queryClient}>
      <DashboardShell
        header={
          <DashboardShellHeader>
            <DashboardShellTitle>Roles & Permissions</DashboardShellTitle>
            <DashboardShellDescription>
              Manage application user roles and permissions
            </DashboardShellDescription>
          </DashboardShellHeader>
        }
      >
        <RoleManagementTable />
      </DashboardShell>
    </HydrateClient>
  );
}
