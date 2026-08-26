import { DashboardShellHeader } from "@/components/shared/dashboard-shell/DashboardShellHeader";
import { DashboardShellTitleSkeleton } from "@/components/shared/dashboard-shell/DashboardShellHeaderSkeleton";
import { DashboardShellSkeleton } from "@/components/shared/dashboard-shell/DashboardShellSkeleton";

import { TaskKanbanSkeleton } from "@/features/task/components/TaskKanbanSkeleton";

export default function Loading() {
  return (
    <DashboardShellSkeleton
      header={
        <DashboardShellHeader>
          <DashboardShellTitleSkeleton />
        </DashboardShellHeader>
      }
    >
      <TaskKanbanSkeleton />
    </DashboardShellSkeleton>
  );
}
