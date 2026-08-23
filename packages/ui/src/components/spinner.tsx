import { Loader2Icon } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";

function Spinner({
  className,
  size = 16,
  ...props
}: React.ComponentProps<"svg"> & { size?: number }) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("animate-spin", className)}
      size={size}
      {...props}
    />
  );
}

export { Spinner };
