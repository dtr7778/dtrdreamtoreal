import {
  Card,
  CardContent,
  CardHeader,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex items-center gap-2">
        <Skeleton className="size-9 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
      </header>

      <Card className="overflow-hidden border-border/60">
        <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:p-8">
          <Skeleton className="size-32 shrink-0 rounded-full" />
          <div className="w-full flex-1 space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="mx-auto h-8 w-72 max-w-full sm:mx-0" />
            <Skeleton className="mx-auto h-4 w-full max-w-xl sm:mx-0" />
            <Skeleton className="mx-auto h-4 w-2/3 max-w-md sm:mx-0" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="py-0">
            <CardContent className="flex items-center gap-3 p-4">
              <Skeleton className="size-9 shrink-0 rounded-lg" />
              <div className="w-full space-y-1.5">
                <Skeleton className="h-5 w-10" />
                <Skeleton className="h-3 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-52 max-w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((__, row) => (
                <div key={row} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-1 w-full rounded-md" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden border-primary/20">
        <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div className="space-y-4">
            <Skeleton className="h-6 w-44 rounded-full" />
            <Skeleton className="h-7 w-80 max-w-full" />
            <Skeleton className="h-4 w-full max-w-lg" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-full max-w-md" />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 p-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-3 w-40" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
