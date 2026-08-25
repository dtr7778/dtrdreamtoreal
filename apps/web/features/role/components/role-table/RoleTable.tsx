"use client";

import { DataTable } from "@workspace/ui/components/data-table/data-table";
import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import { FiltersType } from "@workspace/ui/types/data-table";

import { ListRoleContractType } from "../../api/role.contract";
import { roleTableColumn } from "./roleTableColumn";

interface RoleTableProps {
  data: ListRoleContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

export function RoleTable({ data, filters, setFilters }: RoleTableProps) {
  "use no memo";

  const table = useDataTable({
    data: data,
    columns: roleTableColumn,
    pageCount: 1,
    filters,
    setFilters,
    meta: {
      queryKeys: {
        searchText: filters?.search ?? undefined,
      },
    },
  });

  return <DataTable table={table} showPagination={false} />;
}
