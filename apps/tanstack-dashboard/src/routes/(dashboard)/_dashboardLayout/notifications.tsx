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
import { NotificationManagement } from "#/features/notification/components/NotificationManagement";
import { querySearchSchema } from "#/lib/querySearchSchema";
import { orpcTQClient } from "#/server/orpc";
import { createFileRoute } from "@tanstack/react-router";

import {
  NotificationCategoryEnumSchema,
  NotificationLevelEnumSchema,
} from "@workspace/drizzle/zod-db-enums";
import { Spinner } from "@workspace/ui/components/spinner";

const searchFields = ["title"];

export const Route = createFileRoute(
  "/(dashboard)/_dashboardLayout/notifications"
)({
  validateSearch: querySearchSchema.extend({
    category: NotificationCategoryEnumSchema.optional(),
    level: NotificationLevelEnumSchema.optional(),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.query(
      orpcTQClient.notification.list.queryOptions({
        input: {
          page: deps.page,
          limit: deps.limit,
          search: deps.search,
          searchFields,
          order: deps.order,
          orderField: deps.orderField,
          filter: {
            category: deps.category,
            level: deps.level,
          },
        },
      })
    ),
  pendingComponent: LoadingComponent,
  component: RouteComponent,
});

function RouteComponent() {
  const { search } = Route.useSearch();

  return (
    <DashboardShell
      header={
        <DashboardShellHeader>
          <DashboardShellTitle>Notifications</DashboardShellTitle>
          <DashboardShellDescription>
            Stay updated with your latest notifications
          </DashboardShellDescription>
        </DashboardShellHeader>
      }
    >
      <NotificationManagement search={search} searchFields={searchFields} />
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
      <div className="flex w-full items-center justify-center p-4">
        <Spinner className="size-14 text-primary" strokeWidth={1} />
      </div>
    </DashboardShellSkeleton>
  );
}
