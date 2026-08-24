"use client";
import NextError from "next/error";
import Link from "next/link";
import { useEffect } from "react";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { TooltipProvider } from "@workspace/ui/components/tooltip";
import "@workspace/ui/globals.css";

import { ThemeProvider } from "@/components/providers/theme-provider";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <TooltipProvider>
          <ThemeProvider>
            <main className="relative flex min-h-screen items-center justify-center overflow-hidden">
              <div className="relative z-10 mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
                {/* Critical error icon */}
                <div className="mx-auto mb-8 flex size-20 items-center justify-center rounded-full border-2 border-destructive/20 bg-destructive/15">
                  <AlertTriangle className="size-10 text-destructive" />
                </div>

                {/* Error heading */}
                <div className="space-y-2">
                  <h1 className="text-4xl leading-tight font-bold text-foreground md:text-5xl">
                    Critical Error
                  </h1>
                  <p className="mx-auto max-w-xl text-lg text-muted-foreground">
                    We&apos;re experiencing a critical issue with the
                    application. Our engineering team has been notified and is
                    working on a fix.
                  </p>
                </div>

                <NextError statusCode={0} />

                {/* Error details */}
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

                {/* Recovery options */}
                <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
                  <Button onClick={() => reset()} size="lg" className="group">
                    <RefreshCw className="size-4 transition-transform duration-700 group-hover:rotate-180" />
                    Retry Application
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    render={
                      <Link href="/">
                        <Home className="size-4" />
                        Return to Home
                      </Link>
                    }
                  />
                </div>

                {/* Information boxes */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-border bg-card/50 p-6">
                    <div className="mb-2 text-2xl font-bold text-primary">
                      🔄
                    </div>
                    <p className="mb-1 text-sm font-semibold text-foreground">
                      Automatic Fix
                    </p>
                    <p className="text-xs text-muted-foreground">
                      We&apos;re working to resolve this automatically
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card/50 p-6">
                    <div className="mb-2 text-2xl font-bold text-primary">
                      📧
                    </div>
                    <p className="mb-1 text-sm font-semibold text-foreground">
                      Notification Sent
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Our team has been immediately notified
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card/50 p-6">
                    <div className="mb-2 text-2xl font-bold text-primary">
                      ⏱️
                    </div>
                    <p className="mb-1 text-sm font-semibold text-foreground">
                      ETA: Soon
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Estimated resolution time: within the hour
                    </p>
                  </div>
                </div>

                {/* Status and contact */}
                <div className="mt-12 space-y-4 border-t border-border pt-12">
                  <p className="text-sm text-muted-foreground">
                    Status:{" "}
                    <span className="font-semibold text-destructive">
                      Critical Error - Under Investigation
                    </span>
                  </p>
                  <Link
                    href="mailto:saiful.islam.rafi.88@gmail.com"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Email Support
                  </Link>
                </div>
              </div>
            </main>
          </ThemeProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
