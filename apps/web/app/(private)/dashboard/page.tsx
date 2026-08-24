import type { Metadata } from "next";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellHeader,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { getAuthUserWithRolesAndPermissionsCache } from "@/features/auth/data/getAuthUser";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const { user } = await getAuthUserWithRolesAndPermissionsCache();

  return (
    <DashboardShell
      header={
        <DashboardShellHeader>
          <DashboardShellTitle>{`Welcome back, ${user.name}`}</DashboardShellTitle>
          <DashboardShellDescription>
            Manage your world and flex your power
          </DashboardShellDescription>
        </DashboardShellHeader>
      }
    ></DashboardShell>
  );
}
