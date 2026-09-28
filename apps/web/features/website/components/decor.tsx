import { cn } from "@workspace/ui/lib/utils";

export function GridPattern({
  className,
  size = 56,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage:
          "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
        backgroundSize: `${size}px ${size}px`,
        maskImage:
          "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 75%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 75%)",
      }}
    />
  );
}

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

export function SpinGlow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute -z-10 rounded-full opacity-30 blur-2xl animate-hero-spin motion-reduce:animate-none",
        className
      )}
      style={{
        backgroundImage:
          "conic-gradient(from 0deg, transparent 0deg, var(--primary) 90deg, transparent 200deg)",
      }}
    />
  );
}

export function DotDivider({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-1.5 rounded-full bg-primary/60",
        className
      )}
    />
  );
}
