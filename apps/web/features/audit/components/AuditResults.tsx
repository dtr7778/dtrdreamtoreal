"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Skeleton } from "@workspace/ui/components/skeleton";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { useAuditResults } from "../api/audit.api.hook";
import { humanizeAuditSection } from "../audit.constants";
import { AuditItemStatusBadge } from "./AuditItemStatusBadge";
import { AuditSummaryCards } from "./AuditSummaryCards";

export function AuditResults({ auditId }: { auditId: string }) {
  const { data, isLoading, isError, error } = useAuditResults(auditId);

  return (
    <QueryStateBoundary
      data={data?.data}
      isLoading={isLoading}
      error={error}
      isError={isError}
      isEmpty={() => false}
      loadingFallback={
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      }
    >
      {(data) => (
        <div className="space-y-5">
          <AuditSummaryCards
            passed={data.summary.passed}
            failed={data.summary.failed + data.summary.error}
            warning={data.summary.warning + data.summary.needsReview}
            total={data.summary.total}
            completed={data.summary.completed}
          />

          {data.sections.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No checks have produced results yet.
            </p>
          ) : (
            <Accordion multiple className="rounded-lg border">
              {data.sections.map((section) => (
                <AccordionItem key={section.section} value={section.section}>
                  <AccordionTrigger>
                    <div className="flex flex-1 items-center justify-between gap-3 pe-2">
                      <span className="text-sm font-medium">
                        {humanizeAuditSection(section.section)}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {section.passed} passed · {section.failed} failed ·{" "}
                        {section.total} total
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-3">
                      {section.items.map((item) => (
                        <li
                          key={item.id}
                          className="space-y-1.5 rounded-md border border-border/60 bg-muted/30 p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-xs font-medium text-foreground">
                              {item.title}
                            </span>
                            <AuditItemStatusBadge status={item.status} />
                          </div>
                          {item.url && (
                            <p className="truncate text-[0.7rem] text-muted-foreground">
                              {item.url}
                            </p>
                          )}
                          {item.message && (
                            <p className="text-xs text-muted-foreground">
                              {item.message}
                            </p>
                          )}
                          {item.evidence != null && (
                            <details className="group">
                              <summary className="cursor-pointer text-xs text-primary hover:underline">
                                View evidence
                              </summary>
                              <pre className="mt-2 max-h-56 overflow-auto rounded-md bg-background p-2 text-[0.7rem] leading-relaxed">
                                {JSON.stringify(item.evidence, null, 2)}
                              </pre>
                            </details>
                          )}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      )}
    </QueryStateBoundary>
  );
}
