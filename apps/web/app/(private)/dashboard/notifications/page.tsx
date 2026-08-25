import { Metadata } from "next";

import { parseAsStringEnum } from "nuqs/server";

import {
  NotificationCategoryEnumSchema,
  NotificationLevelEnumSchema,
} from "@workspace/drizzle/zod-db-enums";

import { tableQuerySearchParams } from "@/lib/nuqs/tableQuerySearchParams";
import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellHeader,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { NotificationManagement } from "@/features/notification/components/NotificationManagement";
import { orpcTQClient } from "@/server/orpc.client";

export const metadata: Metadata = {
  title: "Notifications",
};

export default async function NotificationPage(
  props: PageProps<"/dashboard/notifications">
) {
  const filters = await tableQuerySearchParams({
    category: parseAsStringEnum(
      NotificationCategoryEnumSchema.options
    ).withOptions({
      clearOnDefault: true,
    }),
    level: parseAsStringEnum(NotificationLevelEnumSchema.options).withOptions({
      clearOnDefault: true,
    }),
  })(props.searchParams);

  const searchFields = ["title"];

  const queryClient = getQueryClient();

  await queryClient.query(
    orpcTQClient.notification.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields,
        order: filters.order ?? undefined,
        orderField: filters.orderField ?? undefined,
        filter: {
          category: filters.category ?? undefined,
          level: filters.level ?? undefined,
        },
      },
    })
  );

  return (
    <HydrateClient client={queryClient}>
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
        <NotificationManagement
          search={filters.search}
          searchFields={searchFields}
        />
      </DashboardShell>
    </HydrateClient>
  );
}
