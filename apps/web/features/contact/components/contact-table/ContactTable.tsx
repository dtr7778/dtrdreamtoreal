"use client";

import { DataTable } from "@workspace/ui/components/data-table/data-table";
import {
  DataTableActionBar,
  DataTableActionBarSelection,
} from "@workspace/ui/components/data-table/data-table-action-bar";
import { DataTableToolbar } from "@workspace/ui/components/data-table/data-table-toolbar";
import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import { FiltersType } from "@workspace/ui/types/data-table";

import { ListContactContractType } from "../../api/contact.contract";
import { contactTableColumn } from "./contactTableColumn";

interface ContactTableProps {
  data: ListContactContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

export function ContactTable({ data, filters, setFilters }: ContactTableProps) {
  "use no memo";
  const table = useDataTable({
    data: data.data,
    columns: contactTableColumn,
    pageCount: data.meta.pageCount,
    filters,
    setFilters,
    meta: {
      queryKeys: {
        searchText: filters?.search ?? undefined,
      },
    },
  });

  return (
    <DataTable
      table={table}
      actionBar={
        <DataTableActionBar table={table}>
          <DataTableActionBarSelection table={table} />
        </DataTableActionBar>
      }
    >
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
