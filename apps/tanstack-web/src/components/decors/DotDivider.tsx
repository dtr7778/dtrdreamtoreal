import { cn } from "@workspace/ui/lib/utils";

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
