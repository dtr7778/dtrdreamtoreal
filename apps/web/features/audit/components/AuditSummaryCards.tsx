import { AlertTriangle, CheckCircle2, ListChecks, XCircle } from "lucide-react";

import { Card, CardContent } from "@workspace/ui/components/card";

interface AuditSummaryCardsProps {
  passed: number;
  failed: number;
  warning: number;
  total: number;
  completed: number;
}

export function AuditSummaryCards({
  passed,
  failed,
  warning,
  total,
  completed,
}: AuditSummaryCardsProps) {
  const stats = [
    {
      label: "Passed",
      value: passed,
      icon: CheckCircle2,
      className: "text-green-600 dark:text-green-400",
    },
    {
      label: "Failed",
      value: failed,
      icon: XCircle,
      className: "text-destructive",
    },
    {
      label: "Warnings",
      value: warning,
      icon: AlertTriangle,
      className: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Checks run",
      value: `${completed}/${total}`,
      icon: ListChecks,
      className: "text-blue-600 dark:text-blue-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {stats.map((stat) => (
        <Card key={stat.label} className="py-0">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <stat.icon className={`size-4 ${stat.className}`} />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-semibold tabular-nums">
                {stat.value}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {stat.label}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
