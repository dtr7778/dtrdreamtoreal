"use client";

import { ClipboardCheck } from "lucide-react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Skeleton } from "@workspace/ui/components/skeleton";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { useCompanyAudits } from "@/features/audit/api/audit.api.hook";
import { AuditCard } from "@/features/audit/components/AuditCard";
import { AuditCreateDialog } from "@/features/audit/components/AuditCreateDialog";
import { usePermissionCheck } from "@/hooks/use-permission-check";

export function AuditStep({
  companyId,
  websiteUrl,
}: {
  companyId: string;
  websiteUrl?: string | null | undefined;
}) {
  const { data, isLoading, isError, error } = useCompanyAudits(companyId);

  const isAllowCreate = usePermissionCheck([
    "system.site_audit.manage",
    "system.site_audit.create",
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Site audits</h3>
          <p className="text-xs text-muted-foreground">
            Run automated SEO, performance, and technical audits for this
            company&apos;s website.
          </p>
        </div>
        {isAllowCreate && (
          <AuditCreateDialog companyId={companyId} websiteUrl={websiteUrl} />
        )}
      </div>

      <QueryStateBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={data?.data}
        isEmpty={(data) => data.data.length === 0}
        loadingFallback={
          <div className="grid gap-4 xl:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-48 w-full" />
            ))}
          </div>
        }
        emptyFallback={
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ClipboardCheck />
              </EmptyMedia>
              <EmptyTitle>No audits yet</EmptyTitle>
              <EmptyDescription>
                Start your first audit to uncover technical issues, performance
                problems, and SEO opportunities.
              </EmptyDescription>
            </EmptyHeader>
            {isAllowCreate && (
              <EmptyContent>
                <AuditCreateDialog
                  companyId={companyId}
                  websiteUrl={websiteUrl}
                />
              </EmptyContent>
            )}
          </Empty>
        }
      >
        {({ data }) => (
          <div className="grid gap-4 xl:grid-cols-2">
            {data.map((audit) => (
              <AuditCard key={audit.id} audit={audit} />
            ))}
          </div>
        )}
      </QueryStateBoundary>
    </div>
  );
}
