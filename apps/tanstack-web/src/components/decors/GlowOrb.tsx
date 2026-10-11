import { cn } from "@workspace/ui/lib/utils";

const orbColors = {
  primary: "bg-primary/25",
  "chart-2": "bg-chart-2/25",
  "chart-3": "bg-chart-3/25",
  "chart-4": "bg-chart-4/25",
} as const;

export function GlowOrb({
  className,
  color = "primary",
}: {
  className?: string;
  color?: keyof typeof orbColors;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute -z-10 rounded-full blur-3xl",
        orbColors[color],
        className
      )}
    />
  );
}
