"use client";

import Link from "next/link";
import { useState } from "react";

import { Eye, Pen, Trash } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { DeleteDialog } from "@/components/DeleteDialog";

import { useDeleteEmployee } from "@/features/company/api/employee.api.hook";
import { ListEmployeeContractType } from "@/features/company/api/employee.contract";
import { usePermissionCheck } from "@/hooks/use-permission-check";

export default function EmployeeTableRowAction({
  employeeData,
}: {
  employeeData: ListEmployeeContractType["output"]["data"]["data"][number];
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

  return (
    <div className="flex items-center gap-2">
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
                      pathname: `/dashboard/employees/${employeeData.id}/update`,
                    }}
                  />
                }
              />
            }
          >
            <Pen />
          </TooltipTrigger>
          <TooltipContent>
            <p>Update employee</p>
          </TooltipContent>
        </Tooltip>
      )}
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
                    pathname: `/dashboard/employees/${employeeData.id}`,
                    search: "tab=details",
                  }}
                />
              }
            />
          }
        >
          <Eye />
        </TooltipTrigger>
        <TooltipContent>
          <p>View details</p>
        </TooltipContent>
      </Tooltip>
      {isAllowDelete && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                onClick={() => setOpenDeleteDialog(true)}
                size="icon"
                variant="destructive"
              />
            }
          >
            <Trash />
            <span className="sr-only">delete employee</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete</p>
          </TooltipContent>
        </Tooltip>
      )}
      {isAllowDelete && (
        <DeleteDialog
          openDeleteDialog={openDeleteDialog}
          setOpenDeleteDialog={setOpenDeleteDialog}
          onDelete={() => deleteEmployee({ employeeIds: [employeeData.id] })}
          isDisable={isDeleting}
        />
      )}
    </div>
  );
}
