"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsStringEnum } from "nuqs";

import {
  TaskPriorityEnumSchema,
  TaskStatusEnumSchema,
} from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import { DataTableGlobalSearch } from "@workspace/ui/components/data-table/data-table-global-search";
import {
  KanbanBoard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@workspace/ui/components/kibo-ui/kanban";
import { useDebouncedCallback } from "@workspace/ui/hooks/use-debounced-callback";

import { createRangeFilterClient } from "@/lib/nuqs/rangeFilter.client";
import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { MetaPagination } from "@/components/MetaPagination";
import { TimeRangeFilter } from "@/components/time-range-filter";

import { useTableQueryState } from "@/hooks/use-table-query-state";
import { orpcTQClient } from "@/server/orpc.client";

import { useUpdateStatusTask } from "../api/task.api.hook";
import { ListTaskContractType } from "../api/task.contract";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { TaskKanbanCard } from "./TaskKanbanCard";
import { TaskKanbanSkeleton } from "./TaskKanbanSkeleton";

type TaskItem = Omit<
  ListTaskContractType["output"]["data"]["data"][number],
  "title"
> & {
  name: string;
  column: string;
};

const columns = TaskStatusEnumSchema.options.map((value) => ({
  id: value,
  name: formatEnumValue(value),
}));

export function TaskKanbanBoard({
  searchFields,
}: {
  searchFields?: string[] | undefined;
}) {
  "use no memo";
  const { filters, setFilters, setSearchFilter } = useTableQueryState({
    additionalKeys: {
      ...createRangeFilterClient(),
      status: parseAsStringEnum(TaskStatusEnumSchema.options).withOptions({
        clearOnDefault: true,
      }),
      priority: parseAsStringEnum(TaskPriorityEnumSchema.options).withOptions({
        clearOnDefault: true,
      }),
    },
  });

  const { data, isLoading, isError, error, refetch } = useQuery(
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
      select: ({ data: { meta, data } }) => ({
        meta,
        data: data.map(({ id, title, status, ...task }) => ({
          ...task,
          id,
          name: title,
          column: status,
        })),
      }),
    })
  );

  const updateTask = useUpdateStatusTask({});

  const globalSearch = useDebouncedCallback(
    (searchValue: string | null) => setSearchFilter(searchValue),
    500
  );

  return (
    <div className="space-y-3">
      <TimeRangeFilter
        rangeSearch={filters}
        setRangeSearch={({ range, startTime, endTime }) =>
          setFilters({
            range,
            startTime,
            endTime,
          })
        }
      />
      <DataTableGlobalSearch
        searchValue={filters.search}
        setSearchValue={globalSearch}
        refresh={refetch}
      >
        <CreateTaskDialog />
      </DataTableGlobalSearch>
      <QueryStateBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={data}
        isEmpty={() => false}
        loadingFallback={<TaskKanbanSkeleton />}
      >
        {({ data, meta }) => (
          <div className="space-y-4">
            <KanbanProvider
              columns={columns}
              data={data}
              className="gap-2"
              onDragEnd={({ active, over }) => {
                if (!over || active.id === over.id) return;

                const task = data.find((item) => item.id === active.id);
                if (!task) return;

                updateTask.mutate({
                  taskId: task.id,
                  status: task.column,
                });
              }}
            >
              {(column) => (
                <KanbanBoard id={column.id} key={column.id}>
                  <KanbanHeader>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs">{column.name}</h4>
                    </div>
                  </KanbanHeader>
                  <KanbanCards id={column.id}>
                    {(task: TaskItem) => (
                      <TaskKanbanCard columnId={column.id} taskData={task} />
                    )}
                  </KanbanCards>
                </KanbanBoard>
              )}
            </KanbanProvider>
            <MetaPagination
              meta={meta}
              onPageChange={(page) => setFilters({ page })}
            />
          </div>
        )}
      </QueryStateBoundary>
    </div>
  );
}
