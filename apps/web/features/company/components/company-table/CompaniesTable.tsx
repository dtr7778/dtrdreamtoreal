"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { Plus, Trash } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { DataTable } from "@workspace/ui/components/data-table/data-table";
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@workspace/ui/components/data-table/data-table-action-bar";
import { DataTableToolbar } from "@workspace/ui/components/data-table/data-table-toolbar";
import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import { FiltersType } from "@workspace/ui/types/data-table";

import { DeleteDialog } from "@/components/DeleteDialog";

import { usePermissionCheck } from "@/hooks/use-permission-check";

import { useDeleteCompany } from "../../api/company.api.hook";
import { ListCompanyContractType } from "../../api/company.contract";
import { companyTableColumn } from "./companyTableColumn";

interface CompaniesTableProps {
  data: ListCompanyContractType["output"]["data"];
  filters: FiltersType;
  setFilters: (filters: Omit<FiltersType, "search">) => void;
}

export function CompaniesTable({
  data,
  filters,
  setFilters,
}: CompaniesTableProps) {
  "use no memo";
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const table = useDataTable({
    data: data.data,
    columns: companyTableColumn,
    pageCount: data.meta.pageCount,
    filters,
    setFilters,
    meta: {
      queryKeys: {
        searchText: filters?.search ?? undefined,
      },
    },
  });

  const isAllowDelete = usePermissionCheck([
    "system.company.manage",
    "system.company.delete",
  ]);
  const isAllowCreate = usePermissionCheck([
    "system.company.manage",
    "system.company.create",
  ]);

  const { mutate: deleteAll, isPending: isDeleting } = useDeleteCompany({
    onSuccess: () => setOpenDeleteDialog(false),
  });

  const handleDeleteAll = useCallback(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map((row) => row.original.id);

    deleteAll({ companyIds: selectedIds });

    table.toggleAllRowsSelected(false);
  }, [table, deleteAll]);

  return (
    <>
      <DataTable
        table={table}
        actionBar={
          <DataTableActionBar table={table}>
            {isAllowDelete && (
              <DataTableActionBarAction
                onClick={() => setOpenDeleteDialog(true)}
                disabled={isDeleting}
                variant="destructive"
              >
                <Trash />
                <span>Delete</span>
              </DataTableActionBarAction>
            )}
            <DataTableActionBarSelection table={table} />
          </DataTableActionBar>
        }
      >
        <DataTableToolbar table={table}>
          {isAllowCreate && (
            <Button
              nativeButton={false}
              render={<Link href="/dashboard/companies/create" />}
            >
              <Plus className="size-4" />
              <span>Create Company</span>
            </Button>
          )}
        </DataTableToolbar>
      </DataTable>
      {isAllowDelete && (
        <DeleteDialog
          openDeleteDialog={openDeleteDialog}
          setOpenDeleteDialog={setOpenDeleteDialog}
          onDelete={handleDeleteAll}
          isDisable={isDeleting}
        />
      )}
    </>
  );
}
