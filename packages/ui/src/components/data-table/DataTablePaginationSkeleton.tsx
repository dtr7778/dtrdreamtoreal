import { ButtonSkeleton } from "@workspace/ui/components/button-skeleton";
import { SelectSkeleton } from "@workspace/ui/components/select-skeleton";
import { cn } from "@workspace/ui/lib/utils";

export function DataTablePaginationSkeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 sm:flex-row sm:gap-8",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <SelectSkeleton className="w-18" />
        <SelectSkeleton className="w-32 sm:w-40" />
      </div>

      <div className="flex flex-col items-center gap-2 sm:flex-row">
        <div className="flex items-center gap-2">
          <ButtonSkeleton className="hidden lg:block" size="icon" />
          <ButtonSkeleton size="icon" />
          <ButtonSkeleton className="w-25" />
          <ButtonSkeleton size="icon" />
          <ButtonSkeleton className="hidden lg:block" size="icon" />
        </div>
      </div>
    </div>
  );
}
