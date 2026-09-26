"use client";

import { AiUsageType } from "@/features/company/company.schema";

function formatCost(cost?: number): string {
  if (cost === undefined) return "cost n/a";
  return `$${cost.toFixed(6)}`;
}

export function DescriptionUsage({ usages }: { usages: AiUsageType[] }) {
  if (usages.length === 0) return null;

  const hasCost = usages.some((usage) => usage.cost !== undefined);
  const totalCost = usages.reduce((sum, usage) => sum + (usage.cost ?? 0), 0);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-dashed bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
      {usages.map((usage, idx) => (
        <span key={`usage-${idx}`} className="inline-flex items-center gap-1.5">
          <span className="font-mono text-foreground/80">{usage.model}</span>
          <span aria-hidden className="text-border">
            ·
          </span>
          {usage.totalTokens.toLocaleString()} tokens
          <span aria-hidden className="text-border">
            ·
          </span>
          {formatCost(usage.cost)}
          <span aria-hidden className="text-border">
            ·
          </span>
          {(usage.latencyMs / 1000).toFixed(1)}s
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5 border-s border-border ps-4 font-medium text-foreground/80">
        Total cost
        <span aria-hidden className="text-border">
          ·
        </span>
        <span className="font-mono">
          {hasCost ? formatCost(totalCost) : "cost n/a"}
        </span>
      </span>
    </div>
  );
}