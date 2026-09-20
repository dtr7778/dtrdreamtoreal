"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Pen, Trash, User } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { DeleteDialog } from "@/components/DeleteDialog";
import {
  TabNavigation,
  TabNavigationContent,
  TabNavigationList,
  TabNavigationTrigger,
} from "@/components/tab-navigation";

import { orpcTQClient } from "@/server/orpc.client";

import { useDeleteEmployee } from "../../api/employee.api.hook";
import { EmployeeDetailsStep } from "./EmployeeDetailsStep";

export function EmployeeDetails({ employeeId }: { employeeId: string }) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const router = useRouter();

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.company.employee.details.queryOptions({
      input: { employeeId },
    })
  );

  const { mutate: deleteEmployee, isPending: isDeleting } = useDeleteEmployee({
    onSuccess: () => {
      setOpenDeleteDialog(false);
      router.push("/dashboard/employees");
    },
  });

  return (
    <QueryStateBoundary
      isLoading={isLoading}
      isError={isError}
      error={error}
      isEmpty={() => false}
      data={data?.data}
    >
      {(data) => {
        const fullName = [data.firstName, data.middleName, data.lastName]
          .filter(Boolean)
          .join(" ");

        const initials = [data.firstName?.[0], data.lastName?.[0]]
          .filter(Boolean)
          .join("")
          .toUpperCase();

        return (
          <div className="space-y-4">
            <div className="overflow-hidden border-border/50 shadow-md shadow-black/5 bg-card rounded-lg border">
              <div className="relative h-28 bg-linear-to-br from-emerald-500/20 via-emerald-500/10 to-transparent">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(16,185,129,0.15),transparent_60%)]" />
              </div>
              <div className="-mt-12 relative px-6 pb-6">
                <div className="flex items-end gap-4">
                  <div className="flex size-20 items-center justify-center rounded-2xl border-4 border-background bg-linear-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20">
                    {initials ? (
                      <span className="text-xl font-bold">{initials}</span>
                    ) : (
                      <User className="size-8" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="pb-1">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                      {fullName}
                    </h2>
                    <div className="mt-1 flex items-center gap-2">
                      {data.jobTitle && (
                        <Badge variant="secondary" className="font-medium">
                          {data.jobTitle}
                        </Badge>
                      )}
                      {data.department && (
                        <Badge variant="outline" className="font-medium">
                          {data.department}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      nativeButton={false}
                      render={
                        <Link
                          href={{
                            pathname: `/dashboard/employees/${employeeId}/update`,
                          }}
                        />
                      }
                    />
                  }
                >
                  <Pen /> <span>Update</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Update employee</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="destructive"
                      onClick={() => setOpenDeleteDialog(true)}
                    />
                  }
                >
                  <Trash /> <span>Delete</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete employee</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <DeleteDialog
              openDeleteDialog={openDeleteDialog}
              setOpenDeleteDialog={setOpenDeleteDialog}
              onDelete={() => deleteEmployee({ employeeIds: [employeeId] })}
              isDisable={isDeleting}
            />

            <TabNavigation className="space-y-4" defaultValue="details">
              <TabNavigationList variant="line">
                <TabNavigationTrigger value="details">
                  <span>Details</span>
                </TabNavigationTrigger>
              </TabNavigationList>
              <TabNavigationContent value="details">
                <EmployeeDetailsStep employeeId={employeeId} />
              </TabNavigationContent>
            </TabNavigation>
          </div>
        );
      }}
    </QueryStateBoundary>
  );
}
