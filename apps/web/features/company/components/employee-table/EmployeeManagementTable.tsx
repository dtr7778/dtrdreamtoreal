"use client";

import { useQuery } from "@tanstack/react-query";

import { DataTableEmpty } from "@workspace/ui/components/data-table/data-table-empty";
import { DataTableGlobalSearch } from "@workspace/ui/components/data-table/data-table-global-search";
import { DataTableSkeleton } from "@workspace/ui/components/data-table/DataTableSkeleton";
import { DataTableToolbarSkeleton } from "@workspace/ui/components/data-table/DataTableToolbarSkeleton";
import { useDebouncedCallback } from "@workspace/ui/hooks/use-debounced-callback";

import { createRangeFilterClient } from "@/lib/nuqs/rangeFilter.client";
import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { ExportData } from "@/components/ExportData";
import { TimeRangeFilter } from "@/components/time-range-filter";

import { useTableQueryState } from "@/hooks/use-table-query-state";
import { orpcTQClient } from "@/server/orpc.client";

import { EmployeesTable } from "./EmployeesTable";

export function EmployeeManagementTable({
  searchFields,
}: {
  searchFields: string[];
}) {
  "use no memo";
  const { filters, setFilters, setSearchFilter } = useTableQueryState({
    additionalKeys: {
      ...createRangeFilterClient(),
    },
  });

  const { data, isLoading, isError, error, refetch } = useQuery(
    orpcTQClient.company.employee.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields,
        order: filters.order ?? undefined,
        orderField: filters.orderField ?? undefined,
        filter: {
          createdAt:
            filters.startTime && filters.endTime
              ? { from: filters.startTime, to: filters.endTime }
              : undefined,
        },
      },
    })
  );

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
        <ExportData isLoading={false} onExport={() => {}} />
      </DataTableGlobalSearch>

      <QueryStateBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={data?.data}
        isEmpty={() => false}
        loadingFallback={
          <DataTableSkeleton>
            <DataTableToolbarSkeleton />
          </DataTableSkeleton>
        }
        emptyFallback={<DataTableEmpty />}
      >
        {(data) => (
          <EmployeesTable
            data={data}
            filters={{
              page: filters.page,
              limit: filters.limit,
              search: filters.search,
              order: filters.order ?? undefined,
              orderField: filters.orderField ?? undefined,
            }}
            setFilters={(filters) => {
              setFilters({
                page: filters?.page,
                limit: filters?.limit,
                order: filters?.order ?? null,
                orderField: filters?.orderField ?? null,
              });
            }}
          />
        )}
      </QueryStateBoundary>
    </div>
  );
}
