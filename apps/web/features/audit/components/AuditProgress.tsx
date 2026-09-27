"use client";

import { Progress } from "@workspace/ui/components/progress";
import { cn } from "@workspace/ui/lib/utils";

interface AuditProgressProps {
  completed: number;
  total: number;
  className?: string;
  showLabel?: boolean;
}

export function AuditProgress({
  completed,
  total,
  className,
  showLabel = true,
}: AuditProgressProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={cn("space-y-1.5", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            <span className="font-medium text-foreground tabular-nums">
              {completed}
            </span>{" "}
            / {total} checks
          </span>
          <span className="tabular-nums">{percent}%</span>
        </div>
      )}
      <Progress value={percent} aria-label="Audit progress" />
    </div>
  );
}
