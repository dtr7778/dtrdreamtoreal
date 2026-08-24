"use client";

import Link from "next/link";

import { AlertCircle, Home, RefreshCw } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-b from-background via-background to-muted/20">
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
        {/* Error icon */}
        <div className="mx-auto mb-8 flex size-20 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-10 animate-pulse text-destructive" />
        </div>

        {/* Error heading */}
        <div className="space-y-2">
          <h1 className="text-4xl leading-tight font-bold text-foreground md:text-5xl">
            Something Went Wrong
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            We encountered an unexpected error while loading this page. Our team
            has been notified and we&apos;re working to fix it.
          </p>
        </div>

        {/* Error details (optional) */}
        {error.message && (
          <div className="my-12 rounded-lg border border-destructive/20 bg-card/50 p-4 text-left backdrop-blur">
            <p className="mb-3 font-mono text-xs text-muted-foreground">
              Error Details:
            </p>
            <p className="font-mono text-sm break-all text-foreground">
              {error.message}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-muted-foreground">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
          <Button onClick={() => reset()} size="lg" className="group">
            <RefreshCw className="size-4 transition-transform duration-700 group-hover:rotate-180" />
            Try Again
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={
              <Link href="/">
                <Home className="size-4" />
                Back to Home
              </Link>
            }
          />
        </div>
      </div>
    </main>
  );
}
