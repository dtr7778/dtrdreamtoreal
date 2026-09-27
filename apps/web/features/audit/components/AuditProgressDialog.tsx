"use client";

import { useEffect, useRef } from "react";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  Info,
  type LucideIcon,
  XCircle,
} from "lucide-react";

import type { AuditLogLevelEnumType } from "@workspace/drizzle/zod-db-enums";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogResponsiveBody,
  DialogResponsiveContent,
  DialogStickyFooter,
  DialogStickyHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";

import { apiClient } from "@/lib/api";
import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { useAuditDetails } from "../api/audit.api.hook";
import {
  type AuditLogStreamEvent,
  useAuditLogStream,
} from "../api/use-audit-log-stream";
import { type AuditStatus, isAuditActive } from "../audit.constants";
import { AuditProgress } from "./AuditProgress";
import { AuditStatusBadge } from "./AuditStatusBadge";

interface AuditProgressDialogProps {
  auditId: string;
  auditName?: string | null | undefined;
  initialStatus?: AuditStatus | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LEVEL_STYLE: Record<
  AuditLogLevelEnumType,
  { icon: LucideIcon; className: string }
> = {
  debug: { icon: Bug, className: "text-muted-foreground" },
  info: { icon: Info, className: "text-blue-600 dark:text-blue-400" },
  warn: {
    icon: AlertTriangle,
    className: "text-orange-600 dark:text-orange-400",
  },
  error: { icon: XCircle, className: "text-destructive" },
};

function formatEventTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "--:--:--";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function LogLine({ event }: { event: AuditLogStreamEvent }) {
  const { icon: Icon, className } =
    LEVEL_STYLE[event.level] ?? LEVEL_STYLE.info;

  return (
    <div className="flex items-start gap-2 py-0.5">
      <span className="shrink-0 text-muted-foreground tabular-nums">
        {formatEventTime(event.timestamp)}
      </span>
      <Icon className={cn("mt-0.5 size-3.5 shrink-0", className)} />
      <span className="wrap-break-word text-foreground">{event.message}</span>
    </div>
  );
}

export function AuditProgressDialog({
  auditId,
  auditName,
  initialStatus,
  open,
  onOpenChange,
}: AuditProgressDialogProps) {
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    data: detailsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useAuditDetails(auditId, {
    enabled: open && Boolean(auditId),
  });

  const effectiveStatus: AuditStatus | undefined =
    detailsData?.data.status ?? initialStatus;
  const isTerminal = effectiveStatus ? !isAuditActive(effectiveStatus) : false;

  const { events, status, isStreaming } = useAuditLogStream(
    open ? auditId : null,
    { enabled: open && Boolean(auditId), terminal: isTerminal }
  );

  useEffect(() => {
    if (status !== "closed") return;
    void refetch();
    void queryClient.invalidateQueries({
      queryKey: apiClient.siteAudit.list.queryKey({ query: {} }),
      exact: false,
    });
  }, [status, refetch, queryClient]);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [events.length]);

  const details = detailsData?.data;
  const lastProgress = [...events]
    .reverse()
    .find((event) => event.type === "progress" && event.data);
  const planned = events.find((event) => event.type === "tasks_planned");

  const total = Number(
    lastProgress?.data?.total ??
      planned?.data?.total ??
      details?.totalItems ??
      0
  );
  const completed = Number(
    lastProgress?.data?.completed ??
      (status === "closed" ? total : (details?.completedItems ?? 0))
  );

  const currentStatus: AuditStatus =
    effectiveStatus ?? (isStreaming ? "running" : "pending");

  const finalEvent = [...events]
    .reverse()
    .find(
      (event) => event.type === "run_completed" || event.type === "run_failed"
    );
  const isCompleted = status === "closed" || isTerminal;
  const isFailed =
    finalEvent?.type === "run_failed" ||
    effectiveStatus === "failed" ||
    effectiveStatus === "cancelled";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogResponsiveContent className="sm:max-w-2xl">
        <DialogStickyHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>
              {isCompleted
                ? isFailed
                  ? "Audit failed"
                  : "Audit complete"
                : "Running audit"}
            </DialogTitle>
            <AuditStatusBadge status={currentStatus} />
          </div>
          <DialogDescription>
            {auditName
              ? `${auditName} — live execution log.`
              : "Live execution log for your audit."}
          </DialogDescription>
        </DialogStickyHeader>

        <DialogResponsiveBody className="space-y-4">
          <QueryStateBoundary
            isLoading={isLoading}
            isError={isError}
            error={error}
            data={detailsData?.data}
            isEmpty={() => false}
            loadingFallback={
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-72 w-full" />
              </div>
            }
          >
            {() => (
              <>
                <AuditProgress completed={completed} total={total} />

                <div
                  ref={scrollRef}
                  className="h-72 overflow-y-auto rounded-lg border border-border/60 bg-muted/30 p-3 font-mono text-xs"
                  role="log"
                  aria-live="polite"
                  aria-label="Audit execution log"
                >
                  {events.length === 0 ? (
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Info className="size-3.5" />
                      {status === "error"
                        ? "Could not connect to the audit log stream."
                        : "Waiting for the first event..."}
                    </p>
                  ) : (
                    events.map((event) => (
                      <LogLine key={event.sequence} event={event} />
                    ))
                  )}
                </div>

                {status === "reconnecting" && !isCompleted && (
                  <p className="text-xs text-muted-foreground">
                    Connection interrupted. Reconnecting...
                  </p>
                )}
              </>
            )}
          </QueryStateBoundary>
        </DialogResponsiveBody>

        <DialogStickyFooter>
          {isCompleted && !isFailed && (
            <span className="me-auto inline-flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
              <CheckCircle2 className="size-3.5" />
              All checks finished
            </span>
          )}
          <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}
