import { Spinner } from "@workspace/ui/components/spinner";

import { DashboardShellHeader } from "@/components/shared/dashboard-shell/DashboardShellHeader";
import {
  DashboardShellDescriptionSkeleton,
  DashboardShellTitleSkeleton,
} from "@/components/shared/dashboard-shell/DashboardShellHeaderSkeleton";
import { DashboardShellSkeleton } from "@/components/shared/dashboard-shell/DashboardShellSkeleton";

export default function Loading() {
  return (
    <DashboardShellSkeleton
      header={
        <DashboardShellHeader>
          <DashboardShellTitleSkeleton />
          <DashboardShellDescriptionSkeleton />
        </DashboardShellHeader>
      }
    >
      <div className="flex w-full items-center justify-center p-4">
        <Spinner className="size-14 text-primary" strokeWidth={1} />
      </div>
    </DashboardShellSkeleton>
  );
}
