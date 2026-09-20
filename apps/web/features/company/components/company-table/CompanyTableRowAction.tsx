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

import { usePermissionCheck } from "@/hooks/use-permission-check";

import { useDeleteCompany } from "../../api/company.api.hook";
import { ListCompanyContractType } from "../../api/company.contract";

export function CompanyTableRowAction({
  companyData,
}: {
  companyData: ListCompanyContractType["output"]["data"]["data"][number];
}) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const isAllowUpdate = usePermissionCheck([
    "system.company.manage",
    "system.company.update",
  ]);
  const isAllowDelete = usePermissionCheck([
    "system.company.manage",
    "system.company.delete",
  ]);

  const { mutate: deleteCompany, isPending: isDeleting } = useDeleteCompany({
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
                      pathname: `/dashboard/companies/${companyData.id}/update`,
                    }}
                  />
                }
              />
            }
          >
            <Pen />
            <span className="sr-only">update company</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Update</p>
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
                    pathname: `/dashboard/companies/${companyData.id}`,
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
            <span className="sr-only">delete company</span>
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
          onDelete={() => deleteCompany({ companyIds: [companyData.id] })}
          isDisable={isDeleting}
        />
      )}
    </div>
  );
}
