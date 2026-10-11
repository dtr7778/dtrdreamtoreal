import { ExportData } from "#/components/ExportData";
import { useQuerySearch } from "#/hooks/use-query-search";
import { orpcTQClient } from "#/server/orpc";
import { useQuery } from "@tanstack/react-query";

import { DataTableEmpty } from "@workspace/ui/components/data-table/data-table-empty";
import { DataTableGlobalSearch } from "@workspace/ui/components/data-table/data-table-global-search";
import { DataTableSkeleton } from "@workspace/ui/components/data-table/data-table-skeleton";
import { DataTableToolbarSkeleton } from "@workspace/ui/components/data-table/data-table-toolbar-skeleton";
import { QueryStateBoundary } from "@workspace/ui/components/tanstack-query/query-state-boundary";
import { useDebouncedCallback } from "@workspace/ui/hooks/use-debounced-callback";

import { useUserExportData } from "../../api/user.api.hook";
import { UsersTable } from "./UsersTable";

export function UserManagementTable({
  searchFields,
}: {
  searchFields: string[];
}) {
  "use no memo";
  const { filters, setFilters, setSearchFilter } = useQuerySearch(
    "/(dashboard)/_dashboardLayout/users/"
  );

  const { mutate: exportData, isPending } = useUserExportData({});

  const { data, isLoading, isError, error, refetch } = useQuery(
    orpcTQClient.user.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields,
        order: filters.order ?? undefined,
        orderField: filters.orderField ?? undefined,
      },
    })
  );

  const globalSearch = useDebouncedCallback(
    (searchValue: string | null) => setSearchFilter(searchValue),
    500
  );

  return (
    <div className="space-y-3">
      <DataTableGlobalSearch
        searchValue={filters.search}
        setSearchValue={globalSearch}
        refresh={refetch}
      >
        <ExportData
          isLoading={isPending}
          onExport={(format) =>
            exportData({
              format,
              order: filters.order,
              orderField: filters.orderField,
            })
          }
        />
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
        {(usersData) => (
          <UsersTable
            data={usersData}
            filters={{
              page: filters.page,
              limit: filters.limit,
              search: filters.search,
              order: filters.order ?? undefined,
              orderField: filters.orderField ?? undefined,
            }}
            setFilters={(updatedFilters) => {
              setFilters({
                page: updatedFilters?.page,
                limit: updatedFilters?.limit,
                order: updatedFilters?.order ?? null,
                orderField: updatedFilters?.orderField ?? null,
              });
            }}
          />
        )}
      </QueryStateBoundary>
    </div>
  );
}
