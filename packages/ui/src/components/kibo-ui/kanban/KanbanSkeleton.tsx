import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";

export function TaskKanbanSkeleton({ totalColumn }: { totalColumn: number }) {
  return (
    <div className="grid size-full auto-cols-fr grid-flow-col gap-4">
      {Array.from({ length: totalColumn }).map((_, idx) => (
        <TaskKanbanColumnSkeleton key={`column-${idx}`} />
      ))}
    </div>
  );
}

function TaskKanbanColumnSkeleton() {
  return (
    <div className="flex h-full min-w-60 flex-col border rounded-md bg-muted/30 ">
      <div className="flex items-center justify-between p-2 border-b">
        <Skeleton className="h-5 w-10 rounded-md" />
        <Skeleton className="h-5 w-7 rounded-full bg-secondary" />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <TaskKanbanCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function TaskKanbanCardSkeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-xl border bg-card p-4 shadow-sm", className)}
      {...props}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-3/4" />
        </div>

        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />

        <div className="flex items-center justify-between pt-2">
          <div className="flex -space-x-2">
            <Skeleton className="h-6 w-6 rounded-full border-2 border-background" />
            <Skeleton className="h-6 w-6 rounded-full border-2 border-background" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}
