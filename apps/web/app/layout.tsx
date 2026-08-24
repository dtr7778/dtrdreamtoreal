import "../server/orpc.server-client";

import { Metadata, Viewport } from "next";
import { Geist_Mono, Public_Sans } from "next/font/google";

import { Toaster } from "react-hot-toast";

import { TooltipProvider } from "@workspace/ui/components/tooltip";
import "@workspace/ui/globals.css";
import { cn } from "@workspace/ui/lib/utils";

import { env } from "@/lib/env";

import { DevPanel } from "@/components/dev-panel";
import { TanstackQueryProvider } from "@/components/providers/tanstack-query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

import { THEME_COLOR } from "@/constants";

const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  applicationName: env.NEXT_PUBLIC_SITE_NAME,
  title: {
    default: `${env.NEXT_PUBLIC_SITE_NAME}`,
    template: `%s | ${env.NEXT_PUBLIC_SITE_NAME}`,
  },
  description: "DTR - Dream To Real website",
  keywords: [],
  formatDetection: {
    telephone: false,
  },

  alternates: {
    canonical: env.NEXT_PUBLIC_SITE_URL,
  },

  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),

  openGraph: {
    title: `${env.NEXT_PUBLIC_SITE_NAME}`,
    description: "DTR - Dream To Real website",
    url: env.NEXT_PUBLIC_SITE_URL,
    siteName: env.NEXT_PUBLIC_SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${env.NEXT_PUBLIC_SITE_NAME}`,
    description: "DTR - Dream To Real website",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: env.NEXT_PUBLIC_SITE_NAME,
  },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      dir="ltr"
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        publicSans.variable
      )}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <TanstackQueryProvider>{children}</TanstackQueryProvider>
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
            <DevPanel
              currentEnv={env.NODE_ENV}
              envVars={Object.entries(process.env)
                .filter(
                  ([k]) => k.startsWith("NEXT_PUBLIC_") || k === "NODE_ENV"
                )
                .map(([key, value]) => ({ key, value: value ?? "" }))}
            />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
