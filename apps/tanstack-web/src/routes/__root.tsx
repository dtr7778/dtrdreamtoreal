import { BackToTop } from "#/components/BackToTop";
import { ScrollProgress } from "#/components/ScrollProgress";
import { SiteFooter } from "#/components/shared/SiteFooter";
import { SiteHeader } from "#/components/shared/SiteHeader";
import { AUTH_ROUTES } from "#/constants";
import { env } from "#/lib/env";
import { globalHead } from "#/lib/siteHead";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  redirect,
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
  beforeLoad: ({ location }) => {
    if (AUTH_ROUTES.includes(location.pathname)) {
      throw redirect({
        href: `${env.VITE_DASHBOARD_URL}${location.pathname}`,
        replace: true,
      });
    }
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
        <TanstackQueryProvider queryClient={context.queryClient}>
          <ThemeProvider defaultTheme="system" storageKey="theme">
            <div className="flex min-h-svh flex-col bg-background">
              <ScrollProgress />
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
              <BackToTop />
            </div>
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
        <Scripts />
      </body>
    </html>
  );
}
