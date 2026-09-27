"use client";

import { useState } from "react";

import { Eye, Pen, Trash } from "lucide-react";

import type { ContractsType } from "@workspace/contract";
import { Button } from "@workspace/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { DeleteDialog } from "@/components/DeleteDialog";

import { usePermissionCheck } from "@/hooks/use-permission-check";

import { useDeleteAudit } from "../api/audit.api.hook";
import { AuditDetailsDrawer } from "./AuditDetailsDrawer";
import { AuditUpdateDialog } from "./AuditUpdateDialog";

interface AuditRowActionsProps {
  audit: ContractsType["siteAudit"]["list"]["output"]["data"]["data"][number];
}

export function AuditRowActions({ audit }: AuditRowActionsProps) {
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openViewAudit, setOpenViewAudit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const isAllowUpdate = usePermissionCheck([
    "system.site_audit.manage",
    "system.site_audit.update",
  ]);
  const isAllowDelete = usePermissionCheck([
    "system.site_audit.manage",
    "system.site_audit.delete",
  ]);

  const { mutate: deleteAudit, isPending: isDeleting } = useDeleteAudit({
    onSuccess: () => setOpenDelete(false),
  });

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size="icon"
              variant="outline"
              onClick={() => setOpenViewAudit(true)}
            />
          }
        >
          <Eye />
          <span className="sr-only">View audit</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>View details</p>
        </TooltipContent>
      </Tooltip>

      <AuditDetailsDrawer
        auditId={audit.id}
        open={openViewAudit}
        onOpenChange={setOpenViewAudit}
      />

      {isAllowUpdate && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="icon"
                variant="outline"
                onClick={() => setOpenUpdate(true)}
              />
            }
          >
            <Pen />
            <span className="sr-only">Update audit</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Update</p>
          </TooltipContent>
        </Tooltip>
      )}

      {isAllowDelete && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="icon"
                variant="destructive"
                onClick={() => setOpenDelete(true)}
              />
            }
          >
            <Trash />
            <span className="sr-only">Delete audit</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete</p>
          </TooltipContent>
        </Tooltip>
      )}

      {isAllowUpdate && (
        <AuditUpdateDialog
          auditId={audit.id}
          open={openUpdate}
          onOpenChange={setOpenUpdate}
        />
      )}

      {isAllowDelete && (
        <DeleteDialog
          openDeleteDialog={openDelete}
          setOpenDeleteDialog={setOpenDelete}
          onDelete={() => deleteAudit({ params: { id: audit.id } })}
          isDisable={isDeleting}
        />
      )}
    </div>
  );
}
