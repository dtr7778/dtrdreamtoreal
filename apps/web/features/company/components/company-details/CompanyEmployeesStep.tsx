"use client";

import Link from "next/link";
import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  Building2,
  Mail,
  Pen,
  Plus,
  Trash,
  User,
  Users,
} from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { DataTableGlobalSearch } from "@workspace/ui/components/data-table/data-table-global-search";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { useDebouncedCallback } from "@workspace/ui/hooks/use-debounced-callback";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { DeleteDialog } from "@/components/DeleteDialog";
import { MetaPagination } from "@/components/MetaPagination";

import { useDeleteEmployee } from "@/features/company/api/employee.api.hook";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { useTableQueryState } from "@/hooks/use-table-query-state";
import { orpcTQClient } from "@/server/orpc.client";

import { ListEmployeeContractType } from "../../api/employee.contract";

export function CompanyEmployeesStep({ companyId }: { companyId: string }) {
  const { filters, setSearchFilter, setFilters } = useTableQueryState({});

  const { data, isLoading, isError, error, refetch } = useQuery(
    orpcTQClient.company.employee.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields: ["firstName", "lastName"],
        filter: {
          companyId,
        },
      },
    })
  );

  const isAllowCreate = usePermissionCheck([
    "system.company_employee.manage",
    "system.company_employee.create",
  ]);

  const globalSearch = useDebouncedCallback(
    (searchValue: string | null) => setSearchFilter(searchValue),
    500
  );

  return (
    <div className="space-y-4">
      <DataTableGlobalSearch
        searchValue={filters.search}
        setSearchValue={globalSearch}
        refresh={refetch}
      >
        {isAllowCreate && (
          <Button
            nativeButton={false}
            render={
              <Link
                href={{
                  pathname: "/dashboard/employees/create",
                  query: {
                    companyId,
                    redirectTo: `/dashboard/companies/${companyId}?tab=employees`,
                  },
                }}
              />
            }
          >
            <Plus className="size-4" />
            <span>Create Employee</span>
          </Button>
        )}
      </DataTableGlobalSearch>
      <QueryStateBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={(d) => d.data.length === 0}
        data={data?.data}
        loadingFallback={
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-19 w-full" />
              <Skeleton className="h-19 w-full" />
              <Skeleton className="h-19 w-full" />
              <Skeleton className="h-19 w-full" />
            </div>
          </div>
        }
        emptyFallback={
          <div className="flex flex-col items-center justify-center p-12">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60">
              <Users
                className="size-7 text-muted-foreground"
                strokeWidth={1.5}
              />
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              No employees found
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Employees will appear here once added to the company
            </p>
          </div>
        }
      >
        {({ data, meta }) => (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <h3 className="font-semibold text-foreground">Team Members</h3>
              </div>
              <Badge variant="secondary" className="font-medium">
                {`${data.length} ${data.length === 1 ? "member" : "members"}`}
              </Badge>
            </div>

            <div className="space-y-2">
              {data.map((employee, idx) => (
                <EmployeeItem employee={employee} idx={idx} />
              ))}
            </div>
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

function EmployeeItem({
  employee,
  idx,
}: {
  idx: number;
  employee: ListEmployeeContractType["output"]["data"]["data"][number];
}) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const isAllowUpdate = usePermissionCheck([
    "system.company_employee.manage",
    "system.company_employee.update",
  ]);
  const isAllowDelete = usePermissionCheck([
    "system.company_employee.manage",
    "system.company_employee.delete",
  ]);

  const { mutate: deleteEmployee, isPending: isDeleting } = useDeleteEmployee({
    onSuccess: () => setOpenDeleteDialog(false),
  });

  const fullName = [employee.firstName, employee.middleName, employee.lastName]
    .filter(Boolean)
    .join(" ");

  const initials = [employee.firstName?.[0], employee.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  return (
    <div
      key={employee.id}
      className="group flex items-center gap-4 rounded-lg p-3 transition-all bg-muted/30 hover:bg-muted/60"
      style={{
        animationDelay: `${idx * 50}ms`,
      }}
    >
      <Link
        href={`/dashboard/employees/${employee.id}?tab=details`}
        className="flex min-w-0 flex-1 items-center gap-4"
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/10 transition-all group-hover:from-primary/25 group-hover:to-primary/10 group-hover:ring-primary/20 group-hover:shadow-md group-hover:shadow-primary/10">
          {initials ? (
            <span className="text-sm font-bold">{initials}</span>
          ) : (
            <User className="size-5" strokeWidth={1.5} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {fullName}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {employee.jobTitle ? (
              <>
                <Briefcase className="size-3 shrink-0" />
                <span className="truncate">{employee.jobTitle}</span>
                {employee.department && (
                  <>
                    <span>·</span>
                    <span className="truncate">{employee.department}</span>
                  </>
                )}
              </>
            ) : employee.department ? (
              <>
                <Building2 className="size-3 shrink-0" />
                <span className="truncate">{employee.department}</span>
              </>
            ) : (
              <span>No job title</span>
            )}
          </div>
          {employee.email && (
            <div className="items-center gap-1.5 text-xs text-muted-foreground flex">
              <Mail className="size-3.5" />
              <span>{employee.email}</span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex shrink-0 items-center gap-2">
        {isAllowUpdate && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="icon"
                  variant="outline"
                  nativeButton={false}
                  render={
                    <Link
                      href={{
                        pathname: `/dashboard/employees/${employee.id}/update`,
                      }}
                    />
                  }
                />
              }
            >
              <Pen className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Update employee</p>
            </TooltipContent>
          </Tooltip>
        )}
        {isAllowDelete && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="destructive"
                  size="icon"
                  className="size-8 text-destructive hover:text-destructive"
                  onClick={() => setOpenDeleteDialog(true)}
                />
              }
            >
              <Trash className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete employee</p>
            </TooltipContent>
          </Tooltip>
        )}
        {isAllowDelete && (
          <DeleteDialog
            openDeleteDialog={openDeleteDialog}
            setOpenDeleteDialog={setOpenDeleteDialog}
            onDelete={() => deleteEmployee({ employeeIds: [employee.id] })}
            isDisable={isDeleting}
          />
        )}
      </div>
    </div>
  );
}
