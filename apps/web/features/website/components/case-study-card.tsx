import { ArrowUpRight } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";

import type { CaseStudy } from "../content/work";
import { Reveal } from "./motion";

const accentGradients: Record<CaseStudy["accent"], string> = {
  primary: "from-primary/30 via-primary/5",
  "chart-2": "from-chart-2/30 via-chart-2/5",
  "chart-3": "from-chart-3/30 via-chart-3/5",
  "chart-4": "from-chart-4/30 via-chart-4/5",
};

export function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <Reveal hover className="h-full">
      <Card className="group/card h-full gap-0 overflow-hidden p-0 ring-border transition-colors hover:ring-primary/40">
        <div
          className={cn(
            "relative flex h-36 items-end bg-linear-to-br to-transparent p-6",
            accentGradients[study.accent]
          )}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[28px_28px]"
          />
          <div className="relative flex w-full items-end justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-card/80 font-heading text-lg font-semibold text-primary backdrop-blur">
                {study.client.charAt(0)}
              </span>
              <span className="font-heading text-lg font-semibold text-foreground">
                {study.client}
              </span>
            </div>
            <ArrowUpRight
              aria-hidden="true"
              className="size-5 text-foreground/40 transition-transform duration-200 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5"
            />
          </div>
        </div>
        <CardHeader className="gap-2 p-6">
          <p className="text-xs font-medium tracking-wide text-primary uppercase">
            {study.category}
          </p>
          <h3 className="font-heading text-lg font-semibold text-foreground">
            {study.title}
          </h3>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4 p-6 pt-0">
          <p className="text-sm/relaxed text-muted-foreground">
            {study.summary}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {study.metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-border bg-muted/40 px-3 py-2"
              >
                <p className="font-heading text-xl font-semibold text-foreground">
                  {metric.value}
                </p>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            {study.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Reveal>
  );
}
