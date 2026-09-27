"use client";

import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { FormatDateCell } from "@/components/format-date/FormatDateCell";

import { useAuditCwvHistory } from "../api/audit.api.hook";

function Metric({ value, unit }: { value: number | null; unit?: string }) {
  if (value == null) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="tabular-nums">
      {value}
      {unit}
    </span>
  );
}

export function AuditCwvHistory({ auditId }: { auditId: string }) {
  const { data, isLoading, isError, error } = useAuditCwvHistory(auditId);

  return (
    <QueryStateBoundary
      data={data?.data}
      isLoading={isLoading}
      isError={isError}
      error={error}
      isEmpty={(data) => data.data.length === 0}
      loadingFallback={<Skeleton className="h-40 w-full" />}
    >
      {({ data }) => (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Strategy</TableHead>
                <TableHead>LCP</TableHead>
                <TableHead>INP</TableHead>
                <TableHead>CLS</TableHead>
                <TableHead>TTFB</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Captured</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((snapshot) => (
                <TableRow key={snapshot.id}>
                  <TableCell className="capitalize">
                    {snapshot.strategy}
                  </TableCell>
                  <TableCell>
                    <Metric value={snapshot.lcp} unit="ms" />
                  </TableCell>
                  <TableCell>
                    <Metric value={snapshot.inp} unit="ms" />
                  </TableCell>
                  <TableCell>
                    <Metric value={snapshot.cls} />
                  </TableCell>
                  <TableCell>
                    <Metric value={snapshot.ttfb} unit="ms" />
                  </TableCell>
                  <TableCell>
                    <Metric value={snapshot.performanceScore} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <FormatDateCell
                      value={snapshot.createdAt}
                      format="dd MMM, yyyy hh:mm aa"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </QueryStateBoundary>
  );
}
