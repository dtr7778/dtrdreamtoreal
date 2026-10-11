import {
  createRouter as createTanStackRouter,
  ErrorComponent,
  Link,
} from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { createQueryClient } from "@workspace/ui/lib/tanstack-query/query-client.orpc";

import { env } from "./lib/env";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: NotFound,
    defaultPendingComponent: Loading,
    defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
    context: {
      queryClient: createQueryClient(),
    },
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-b from-background via-background to-muted/20">
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
        {/* Error number with gradient */}
        <div className="mb-2 bg-linear-to-r from-primary to-accent bg-clip-text text-9xl font-bold text-transparent">
          404<span className="text-destructive">!</span>
        </div>

        {/* Message */}
        <p className="mx-auto my-8 max-w-xl text-lg text-muted-foreground">
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </p>

        {/* CTA Button */}
        <Button
          size="lg"
          nativeButton={false}
          render={
            <Link to="/">
              <ArrowLeft className="size-4" />
              <span>Go Home</span>
            </Link>
          }
        />
      </div>
    </main>
  );
}

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-md px-4">
        {/* Logo/Brand */}
        <div className="mb-12 flex flex-col items-center justify-center gap-4">
          <div className="flex aspect-square size-8 items-center justify-center">
            <img src="/sitelogo.png" alt={`${env.VITE_APP_NAME} logo`} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {env.VITE_APP_NAME}
          </h1>
        </div>

        {/* Loading Spinner */}
        <div className="space-y-8">
          {/* Animated spinner */}
          <div className="flex justify-center">
            <Spinner className="size-16 text-primary" strokeWidth={1} />
          </div>

          {/* Loading message */}
          <div className="space-y-2 text-center">
            <p className="font-medium text-foreground">
              Finding your perfect service
            </p>
            <p className="text-center text-xs text-muted-foreground">
              This may take a moment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
