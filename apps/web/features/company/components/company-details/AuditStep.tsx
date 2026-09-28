"use client";

import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck } from "lucide-react";

import { DataTableGlobalSearch } from "@workspace/ui/components/data-table/data-table-global-search";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useDebouncedCallback } from "@workspace/ui/hooks/use-debounced-callback";

import { apiClient } from "@/lib/api";
import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { MetaPagination } from "@/components/MetaPagination";

import { AuditCard } from "@/features/audit/components/AuditCard";
import { AuditCreateDialog } from "@/features/audit/components/AuditCreateDialog";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import { useTableQueryState } from "@/hooks/use-table-query-state";

export function AuditStep({
  companyId,
  websiteUrl,
}: {
  companyId: string;
  websiteUrl?: string | null | undefined;
}) {
  const { filters, setSearchFilter, setFilters } = useTableQueryState({});

  const { data, isLoading, isError, error, refetch } = useQuery(
    apiClient.siteAudit.list.queryOptions({
      input: {
        query: {
          page: filters.page,
          limit: filters.limit,
          search: filters.search,
          searchFields: ["name", "url"],
          order: "desc",
          orderField: "createdAt",
          filter: { companyId },
        },
      },
    })
  );

  const isAllowCreate = usePermissionCheck([
    "system.site_audit.manage",
    "system.site_audit.create",
  ]);

  const globalSearch = useDebouncedCallback(
    (searchValue: string | null) => setSearchFilter(searchValue),
    500
  );

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
      <DataTableGlobalSearch
        searchValue={filters.search}
        setSearchValue={globalSearch}
        refresh={refetch}
      />

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
          </Empty>
        }
      >
        {({ data, meta }) => (
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-2">
              {data.map((audit) => (
                <AuditCard key={audit.id} audit={audit} />
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
