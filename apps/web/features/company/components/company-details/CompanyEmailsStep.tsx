"use client";

import { useQuery } from "@tanstack/react-query";
import { Mail, MailCheck, MessageSquare, User } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { DataTableGlobalSearch } from "@workspace/ui/components/data-table/data-table-global-search";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useDebouncedCallback } from "@workspace/ui/hooks/use-debounced-callback";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { MetaPagination } from "@/components/MetaPagination";

import { useTableQueryState } from "@/hooks/use-table-query-state";
import { orpcTQClient } from "@/server/orpc.client";

import { ListCompanyEmailThreadsContractType } from "../../api/company.contract";
import { CompanyEmailThreadCreateDialog } from "./CompanyEmailThreadCreateDialog";

export function CompanyEmailsStep({ companyId }: { companyId: string }) {
  const { filters, setSearchFilter, setFilters } = useTableQueryState({});

  const { data, isLoading, isError, error, refetch } = useQuery(
    orpcTQClient.company.emailThread.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields: ["subject", "contactEmail"],
        companyId,
      },
    })
  );

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
        <CompanyEmailThreadCreateDialog companyId={companyId} />
      </DataTableGlobalSearch>
      <QueryStateBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={(d) => d.data.length === 0}
        data={data?.data}
        loadingFallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        }
        emptyFallback={
          <div className="flex flex-col items-center justify-center p-12">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60">
              <Mail
                className="size-7 text-muted-foreground"
                strokeWidth={1.5}
              />
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              No email threads found
            </p>
          </div>
        }
      >
        {({ data, meta }) => (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-primary" />
                <h3 className="font-semibold text-foreground">Email Threads</h3>
              </div>
              <Badge variant="secondary" className="font-medium">
                {`${data.length} ${data.length === 1 ? "thread" : "threads"}`}
              </Badge>
            </div>

            <div className="space-y-2">
              {data.map((thread, idx) => (
                <EmailThreadItem key={thread.id} thread={thread} idx={idx} />
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

function EmailThreadItem({
  thread,
  idx,
}: {
  idx: number;
  thread: ListCompanyEmailThreadsContractType["output"]["data"]["data"][number];
}) {
  const createdAt = new Date(thread.createdAt);

  return (
    <div
      key={thread.id}
      className="group flex items-center gap-4 rounded-xl p-3 transition-all bg-muted/40 hover:bg-muted/60"
      style={{
        animationDelay: `${idx * 50}ms`,
      }}
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-500/15 to-blue-500/5 text-blue-500 ring-1 ring-blue-500/10 transition-all group-hover:from-blue-500/25 group-hover:to-blue-500/10 group-hover:ring-blue-500/20 group-hover:shadow-md group-hover:shadow-blue-500/10">
        {thread.isClosed ? (
          <MailCheck className="size-5" strokeWidth={1.5} />
        ) : (
          <MessageSquare className="size-5" strokeWidth={1.5} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {thread.subject}
          </p>
          {thread.isClosed && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              Closed
            </Badge>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          {thread.contactName ? (
            <>
              <User className="size-3 shrink-0" />
              <span className="truncate">{thread.contactName}</span>
              <span>·</span>
              <span className="truncate">{thread.contactEmail}</span>
            </>
          ) : (
            <>
              <Mail className="size-3 shrink-0" />
              <span className="truncate">{thread.contactEmail}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
          <MessageSquare className="size-3.5" />
          <span>
            {`${thread.totalEmail} ${thread.totalEmail === 1 ? "email" : "emails"}`}
          </span>
        </div>
        <div className="hidden text-xs text-muted-foreground/70 sm:block">
          {createdAt.toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
