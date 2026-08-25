"use client";

import Link from "next/link";

import { Eye } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { usePermissionCheck } from "@/hooks/use-permission-check";

import { ListUserContractType } from "../../api/user.contract";
import UserUpdateDialog from "../UserUpdateDialog";

export default function UserTableRowAction({
  userData,
}: {
  userData: ListUserContractType["output"]["data"]["data"][number];
}) {
  const isAllowUpdate = usePermissionCheck([
    "self.user.manage",
    "self.user.update",
    "system.user.manage",
    "system.user.update",
  ]);

  return (
    <div className="flex items-center gap-2">
      {isAllowUpdate && <UserUpdateDialog userData={userData} />}
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
                    pathname: `/dashboard/admin/users/${userData.id}`,
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
    </div>
  );
}
