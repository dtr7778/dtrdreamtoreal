import { ButtonSkeleton } from "@workspace/ui/components/button-skeleton";
import { Spinner } from "@workspace/ui/components/spinner";

import { DashboardShellHeader } from "@/components/shared/dashboard-shell/DashboardShellHeader";
import { DashboardShellSkeleton } from "@/components/shared/dashboard-shell/DashboardShellSkeleton";

export default function Loading() {
  return (
    <DashboardShellSkeleton
      className="mx-auto w-full max-w-5xl"
      header={
        <DashboardShellHeader>
          <ButtonSkeleton />
        </DashboardShellHeader>
      }
    >
      <div className="flex w-full items-center justify-center p-4">
        <Spinner className="size-14 text-primary" strokeWidth={1} />
      </div>
    </DashboardShellSkeleton>
  );
}
