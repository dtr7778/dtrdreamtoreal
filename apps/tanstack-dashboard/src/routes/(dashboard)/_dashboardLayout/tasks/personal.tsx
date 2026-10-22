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
import { PersonalTasks } from "#/features/task/components/PersonalTasks";
import { head } from "#/lib/siteHead";
import { orpcTQClient } from "#/server/orpc";
import { createFileRoute } from "@tanstack/react-router";

import { TaskKanbanSkeleton } from "@workspace/ui/components/kibo-ui/kanban/KanbanSkeleton";

export const Route = createFileRoute(
  "/(dashboard)/_dashboardLayout/tasks/personal"
)({
  loader: ({ context }) =>
    context.queryClient.query(
      orpcTQClient.task.personal.list.queryOptions({ input: {} })
    ),
  head: ({ match }) =>
    head({
      titleByTemplate: "Personal Tasks",
      pathname: match.pathname,
      description: "Your private task board, only visible to you.",
    }),
  pendingComponent: LoadingComponent,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DashboardShell
      header={
        <DashboardShellHeader>
          <DashboardShellTitle>Personal Tasks</DashboardShellTitle>
          <DashboardShellDescription>
            Your private task board, only visible to you
          </DashboardShellDescription>
        </DashboardShellHeader>
      }
    >
      <PersonalTasks />
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
