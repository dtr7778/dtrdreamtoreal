import { cn } from "@workspace/ui/lib/utils";

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
