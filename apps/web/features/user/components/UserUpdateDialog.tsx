"use client";

import { useState } from "react";

import { Pen } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogDescription,
  DialogResponsiveBody,
  DialogResponsiveContent,
  DialogStickyHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { useAuthStore } from "@/stores/zustand/auth/AuthStoreContext";

import { ListUserContractType } from "../api/user.contract";
import { UserBannedForm } from "./forms/UserBannedForm";
import UserRoleUpdateForm from "./forms/UserRoleUpdateForm";

export default function UserUpdateDialog({
  userData,
}: {
  userData: ListUserContractType["output"]["data"]["data"][number];
}) {
  "use no memo";
  const [open, setOpen] = useState<boolean>(false);
  const authUser = useAuthStore((state) => state.user!);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <DialogTrigger render={<Button variant="outline" size="icon" />} />
          }
        >
          <Pen />
        </TooltipTrigger>
        <TooltipContent>
          <p>Update user</p>
        </TooltipContent>
      </Tooltip>

      <DialogResponsiveContent className="w-full sm:max-w-xl">
        <DialogStickyHeader>
          <DialogTitle>Update &quot;{userData.name}&quot;</DialogTitle>
          <DialogDescription>Carefully update user data</DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <div className="space-y-6">
            {authUser.id !== userData.id && (
              <UserBannedForm
                initialData={{
                  userId: userData.id,
                  banned: userData?.banned ?? false,
                  banReason: userData?.banReason ?? "",
                  banExpires: userData?.banExpires
                    ? new Date(userData?.banExpires)
                    : undefined,
                }}
                onSuccess={() => setOpen(false)}
              />
            )}
            <UserRoleUpdateForm
              userId={userData.id}
              roleNames={userData.roles.map(({ roleName }) => roleName)}
              onSuccess={() => setOpen(false)}
            />
          </div>
        </DialogResponsiveBody>
      </DialogResponsiveContent>
    </Dialog>
  );
}
