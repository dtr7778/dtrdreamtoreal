import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";

export function SelectSkeleton({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof Skeleton> & {
  size?: "default" | "sm";
}) {
  return (
    <Skeleton
      data-size={size}
      className={cn("data-[size=default]:h-7 data-[size=sm]:h-6", className)}
      {...props}
    />
  );
}
