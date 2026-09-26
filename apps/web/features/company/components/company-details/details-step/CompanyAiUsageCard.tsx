"use client";

import {
  Activity,
  Clock,
  Coins,
  Cpu,
  Gauge,
  Hash,
  Sparkles,
} from "lucide-react";

import { formatCurrency, formatEnumValue } from "@workspace/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Separator } from "@workspace/ui/components/separator";

import { FormatDateCell } from "@/components/format-date/FormatDateCell";

import { CompanyDetailsContractType } from "@/features/company/api/company.contract";

type AiUsages = CompanyDetailsContractType["output"]["data"]["aiUsages"];

export function CompanyAiUsageCard({ usages }: { usages: AiUsages }) {
  const hasCost = usages.some((usage) => usage.cost != null);
  const totalCost = usages.reduce((sum, usage) => sum + (usage.cost ?? 0), 0);
  const totalTokens = usages.reduce((sum, usage) => sum + usage.totalTokens, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h3 className="font-semibold text-foreground">AI Usage</h3>
        </CardTitle>
        <CardAction>
          <Badge variant="secondary" className="font-medium">
            {`${usages.length} ${usages.length === 1 ? "run" : "runs"}`}
          </Badge>
        </CardAction>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-4">
        {usages.length === 0 ? (
          <Empty className="border bg-muted/20 py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Sparkles />
              </EmptyMedia>
              <EmptyTitle>No AI usage yet</EmptyTitle>
              <EmptyDescription>
                AI runs that generate this company&apos;s content will appear
                here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="grid gap-2">
              <div className="flex items-center gap-3 rounded-md border border-border/60 bg-muted/30 p-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Coins className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Total cost
                  </p>
                  <p className="truncate font-mono text-sm font-semibold text-foreground">
                    {hasCost
                      ? formatCurrency(totalCost, { maximumFractionDigits: 10 })
                      : "cost n/a"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-md border border-border/60 bg-muted/30 p-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Hash className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Total tokens
                  </p>
                  <p className="truncate font-mono text-sm font-semibold text-foreground">
                    {totalTokens.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {usages.map((usage) => (
                <AiUsageItem key={usage.id} usage={usage} />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function AiUsageItem({ usage }: { usage: AiUsages[number] }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 space-y-2 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <Cpu className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate font-mono text-xs font-medium text-foreground/90">
            {usage.model}
          </span>
        </div>
      </div>

      {usage.activity && (
        <Badge variant="outline" className="shrink-0 text-xs">
          <Activity className="size-3" />
          <span>{formatEnumValue(usage.activity)}</span>
        </Badge>
      )}

      <div className=" grid grid-cols-2 gap-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Hash className="size-3.5" />
          <span>{`${usage.promptTokens.toLocaleString()} + ${usage.completionTokens.toLocaleString()} = ${usage.totalTokens.toLocaleString()}`}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Coins className="size-3.5" />
          <span className="font-mono">
            {usage.cost
              ? formatCurrency(usage.cost, { maximumFractionDigits: 10 })
              : "N/A"}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Gauge className="size-3.5" />
          <span>{(usage.latencyMs / 1000).toFixed(1)}s</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5" />
          <FormatDateCell format="P" value={usage.createdAt} />
        </span>
      </div>
    </div>
  );
}
