import type { ComponentProps, ReactNode } from "react";

import { cn } from "@workspace/ui/lib/utils";

import { Reveal } from "./motion";
import { TextReveal } from "./text-reveal";

const titleClassName =
  "font-heading max-w-2xl text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl lg:text-4xl";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}

export function Section({ className, ...props }: ComponentProps<"section">) {
  return (
    <section className={cn("py-16 sm:py-20 lg:py-24", className)} {...props} />
  );
}

export function Eyebrow({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase",
        className
      )}
      {...props}
    />
  );
}

interface SectionHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "start" | "center";
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        align === "center" ? "items-center" : "items-start",
        action && "sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <Reveal
        className={cn(
          "flex min-w-0 flex-col gap-4",
          align === "center"
            ? "items-center text-center"
            : "items-start text-left"
        )}
      >
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        {typeof title === "string" ? (
          <TextReveal as="h2" by="word" className={titleClassName}>
            {title}
          </TextReveal>
        ) : (
          <h2 className={titleClassName}>{title}</h2>
        )}
        {description ? (
          <p className="max-w-2xl text-sm/relaxed text-muted-foreground sm:text-base/relaxed">
            {description}
          </p>
        ) : null}
      </Reveal>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
