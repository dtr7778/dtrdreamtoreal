import { DashboardShell } from "#/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellHeader,
  DashboardShellTitle,
} from "#/components/shared/dashboard-shell/DashboardShellHeader";
import {
  DashboardShellDescriptionSkeleton,
  DashboardShellTitleSkeleton,
} from "#/components/shared/dashboard-shell/DashboardShellHeaderSkeleton";
import { DashboardShellSkeleton } from "#/components/shared/dashboard-shell/DashboardShellSkeleton";
import { CompanyTasks } from "#/features/task/components/CompanyTasks";
import { head } from "#/lib/siteHead";
import { orpcTQClient } from "#/server/orpc";
import { createFileRoute } from "@tanstack/react-router";

import { TaskKanbanSkeleton } from "@workspace/ui/components/kibo-ui/kanban/KanbanSkeleton";

export const Route = createFileRoute("/(dashboard)/_dashboardLayout/tasks/")({
  loader: ({ context }) =>
    context.queryClient.query(
      orpcTQClient.task.company.list.queryOptions({ input: {} })
    ),
  head: ({ match }) =>
    head({
      titleByTemplate: "All Tasks",
      pathname: match.pathname,
      description: "Shared tasks everyone in the company can see and update.",
    }),
  pendingComponent: LoadingComponent,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DashboardShell
      header={
        <DashboardShellHeader>
          <DashboardShellTitle>Company Tasks</DashboardShellTitle>
          <DashboardShellDescription>
            Shared tasks everyone in the company can see and update
          </DashboardShellDescription>
        </DashboardShellHeader>
      }
    >
      <CompanyTasks />
    </DashboardShell>
  );
}

function LoadingComponent() {
  return (
    <DashboardShellSkeleton
      header={
        <DashboardShellHeader>
          <DashboardShellTitleSkeleton />
          <DashboardShellDescriptionSkeleton />
        </DashboardShellHeader>
      }
    >
      <TaskKanbanSkeleton totalColumn={4} />
    </DashboardShellSkeleton>
  );
}
