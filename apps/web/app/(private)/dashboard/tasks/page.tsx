import { Metadata } from "next";

import { parseAsStringEnum } from "nuqs/server";

import {
  TaskPriorityEnumSchema,
  TaskStatusEnumSchema,
} from "@workspace/drizzle/zod-db-enums";

import { createRangeFilterServer } from "@/lib/nuqs/rangeFilter.server";
import { tableQuerySearchParams } from "@/lib/nuqs/tableQuerySearchParams";
import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellHeader,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { TaskKanbanBoard } from "@/features/task/components/TaskKanbanBoard";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Tasks",
};

export default async function TasksPage(props: PageProps<"/dashboard/tasks">) {
  await requireUserPermissionsCache(["system.task.manage", "system.task.list"]);

  const queryClient = getQueryClient();

  const filters = await tableQuerySearchParams({
    ...createRangeFilterServer(),
    status: parseAsStringEnum(TaskStatusEnumSchema.options).withOptions({
      clearOnDefault: true,
    }),
    priority: parseAsStringEnum(TaskPriorityEnumSchema.options).withOptions({
      clearOnDefault: true,
    }),
  })(props.searchParams);

  const searchFields = ["title"];

  await queryClient.query(
    orpcTQClient.task.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields,
        order: filters.order ?? undefined,
        orderField: filters.orderField ?? undefined,
        filter: {
          status: filters.status ?? undefined,
          priority: filters.priority ?? undefined,
          createdAt:
            filters.startTime && filters.endTime
              ? { from: filters.startTime, to: filters.endTime }
              : undefined,
        },
      },
    })
  );

  return (
    <HydrateClient client={queryClient}>
      <DashboardShell
        header={
          <DashboardShellHeader>
            <DashboardShellTitle>Tasks</DashboardShellTitle>
          </DashboardShellHeader>
        }
      >
        <TaskKanbanBoard searchFields={searchFields} />
      </DashboardShell>
    </HydrateClient>
  );
}
