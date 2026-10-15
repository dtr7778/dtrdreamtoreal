import { DevPanel } from "#/components/dev-panel";
import { SerwistProvider } from "#/components/SerwistProvider";
import { requireSessions } from "#/features/auth/auth.functions";
import { env } from "#/lib/env";
import { globalHead } from "#/lib/siteHead";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Toaster } from "react-hot-toast";

import { TanstackQueryProvider } from "@workspace/ui/components/tanstack-query/tanstack-query-provider";
import { ThemeProvider } from "@workspace/ui/components/theme-provider";

interface RouterContextProps {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContextProps>()({
  beforeLoad: async () => {
    const result = await requireSessions();

    return {
      user: result?.user,
      session: result?.session,
      roles: result?.roles,
      permissions: result?.permissions,
    };
  },
  head: () => globalHead(),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const context = Route.useRouteContext();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased wrap-anywhere">
        <SerwistProvider>
          <TanstackQueryProvider queryClient={context.queryClient}>
            <ThemeProvider defaultTheme="system" storageKey="theme">
              {children}
              <DevPanel
                currentEnv={env.VITE_ENVIRONMENT}
                envVars={Object.entries(import.meta.env)
                  .filter(([k]) => k.startsWith("VITE_"))
                  .map(([key, value]) => ({ key, value: value ?? "" }))}
              />
              <Toaster
                position="top-center"
                reverseOrder={true}
                gutter={6}
                toastOptions={{
                  duration: 3000,
                  removeDelay: 2000,
                  className: "__react-hot-toast",
                }}
              />
              <TanStackDevtools
                config={{
                  position: "bottom-right",
                }}
                plugins={[
                  {
                    name: "Tanstack Router",
                    render: <TanStackRouterDevtoolsPanel />,
                  },
                  {
                    name: "Tanstack Query",
                    render: <ReactQueryDevtoolsPanel />,
                  },
                ]}
              />
            </ThemeProvider>
          </TanstackQueryProvider>
        </SerwistProvider>
        <Scripts />
      </body>
    </html>
  );
}
