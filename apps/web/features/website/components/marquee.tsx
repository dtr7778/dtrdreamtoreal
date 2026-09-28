"use client";

import { useReducedMotion } from "motion/react";

import { cn } from "@workspace/ui/lib/utils";

function Row({ items }: { items: Array<string> }) {
  return (
    <div className="flex shrink-0 items-center">
      {items.map((item) => (
        <span
          key={item}
          className="flex items-center gap-6 pe-6 text-sm font-medium text-muted-foreground"
        >
          {item}
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-primary/50"
          />
        </span>
      ))}
    </div>
  );
}

export function Marquee({
  items,
  className,
}: {
  items: Array<string>;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <ul
        className={cn(
          "flex flex-wrap items-center justify-center gap-x-6 gap-y-2",
          className
        )}
      >
        {items.map((item) => (
          <li key={item} className="text-sm font-medium text-muted-foreground">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={cn("group relative flex overflow-hidden", className)}>
      <div className="flex w-max animate-marquee motion-reduce:animate-none group-hover:paused">
        <Row items={items} />
        <Row items={items} />
      </div>
    </div>
  );
}
