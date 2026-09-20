"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Building2, Pen, Trash } from "lucide-react";

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

import { usePermissionCheck } from "@/hooks/use-permission-check";
import { orpcTQClient } from "@/server/orpc.client";

import { useDeleteCompany } from "../../api/company.api.hook";
import { CompanyDetailsStep } from "./CompanyDetailsStep";
import { CompanyEmailsStep } from "./CompanyEmailsStep";
import { CompanyEmployeesStep } from "./CompanyEmployeesStep";

export function CompanyDetails({ companyId }: { companyId: string }) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const router = useRouter();
  const isAllowUpdate = usePermissionCheck([
    "system.company.manage",
    "system.company.update",
  ]);
  const isAllowDelete = usePermissionCheck([
    "system.company.manage",
    "system.company.delete",
  ]);

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.company.details.queryOptions({
      input: { companyId },
    })
  );

  const { mutate: deleteCompany, isPending: isDeleting } = useDeleteCompany({
    onSuccess: () => {
      setOpenDeleteDialog(false);
      router.push("/dashboard/companies");
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
      {(data) => (
        <div className="space-y-4">
          <div className="overflow-hidden border-border/50 shadow-md shadow-black/5 bg-card rounded-lg border">
            <div className="relative h-20 bg-linear-to-br from-primary/20 via-primary/10 to-transparent">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(37,99,235,0.15),transparent_60%)]" />
            </div>
            <div className="-mt-10 relative px-6 pb-6">
              <div className="flex items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-2xl border-4 border-background bg-linear-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20">
                  <Building2 className="size-8" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {data.name}
                  </h2>
                  {data.legalName && (
                    <p className="text-sm text-muted-foreground">
                      {data.legalName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAllowUpdate && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="secondary"
                      nativeButton={false}
                      render={
                        <Link
                          href={{
                            pathname: `/dashboard/companies/${companyId}/update`,
                          }}
                        />
                      }
                    />
                  }
                >
                  <Pen /> <span>Update</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Update company</p>
                </TooltipContent>
              </Tooltip>
            )}

            {isAllowDelete && (
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
                  <p>Delete company</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          {isAllowDelete && (
            <DeleteDialog
              openDeleteDialog={openDeleteDialog}
              setOpenDeleteDialog={setOpenDeleteDialog}
              onDelete={() => deleteCompany({ companyIds: [companyId] })}
              isDisable={isDeleting}
            />
          )}

          <TabNavigation className="space-y-4" defaultValue="details">
            <TabNavigationList variant="line">
              <TabNavigationTrigger value="details">
                <span>Details</span>
              </TabNavigationTrigger>
              <TabNavigationTrigger value="employees">
                <span>Employees</span>
              </TabNavigationTrigger>
              <TabNavigationTrigger value="emails">
                <span>Emails</span>
              </TabNavigationTrigger>
            </TabNavigationList>
            <TabNavigationContent value="details">
              <CompanyDetailsStep companyId={companyId} />
            </TabNavigationContent>
            <TabNavigationContent value="employees">
              <CompanyEmployeesStep companyId={companyId} />
            </TabNavigationContent>
            <TabNavigationContent value="emails">
              <CompanyEmailsStep companyId={companyId} />
            </TabNavigationContent>
          </TabNavigation>
        </div>
      )}
    </QueryStateBoundary>
  );
}
