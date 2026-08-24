import { AlertCircle } from "lucide-react";

import { Skeleton } from "@workspace/ui/components/skeleton";

function DefaultSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

function DefaultEmpty() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12 text-center text-muted-foreground">
      No results found.
    </div>
  );
}

interface QueryStateBoundaryProps<T> {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  data: T | undefined;
  isEmpty: (data: T) => boolean;
  loadingFallback?: React.ReactNode;
  emptyFallback?: React.ReactNode;
  children: (data: T) => React.ReactNode;
}

export function QueryStateBoundary<T>({
  isLoading,
  isError,
  error,
  data,
  isEmpty,
  loadingFallback = <DefaultSkeleton />,
  emptyFallback = <DefaultEmpty />,
  children,
}: QueryStateBoundaryProps<T>) {
  if (isLoading) {
    return <>{loadingFallback}</>;
  }

  if (isError) {
    return (
      <div className="mx-auto space-y-2 max-w-xl px-4 py-6 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-1/2 animate-pulse text-destructive" />
        </div>
        <h1 className="text-2xl leading-tight font-bold text-foreground">
          Something Went Wrong
        </h1>
        {error && (
          <div className="rounded-lg border border-destructive/20 bg-card/50 p-4 text-left backdrop-blur">
            <p className="mb-3 font-mono text-xs text-muted-foreground">
              Error Details:
            </p>
            <p className="font-mono text-sm break-all text-foreground">
              {error.message}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (!data || isEmpty(data)) {
    return <>{emptyFallback}</>;
  }

  return <>{children(data)}</>;
}
