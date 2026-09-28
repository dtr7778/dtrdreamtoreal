import { cn } from "@workspace/ui/lib/utils";

import type { ServiceIconKey } from "../content/services";
import { Reveal } from "./motion";
import { ServiceIcon } from "./service-icon";

interface Stat {
  value: string;
  label: string;
  hint?: string;
  icon?: ServiceIconKey;
}

export function StatBand({
  stats,
  className,
}: {
  stats: Array<Stat>;
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4",
        className
      )}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center gap-2 bg-card px-6 py-8 text-center"
        >
          {stat.icon ? (
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ServiceIcon name={stat.icon} className="size-5" />
            </div>
          ) : null}
          <span className="font-heading text-3xl font-semibold text-foreground">
            {stat.value}
          </span>
          <span className="text-sm font-medium text-foreground">
            {stat.label}
          </span>
          {stat.hint ? (
            <span className="text-xs text-muted-foreground">{stat.hint}</span>
          ) : null}
        </div>
      ))}
    </Reveal>
  );
}
