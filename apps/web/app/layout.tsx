import { Geist_Mono, Public_Sans } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { cn } from "@workspace/ui/lib/utils"
import { Metadata, Viewport } from "next"
import { THEME_COLOR } from "@/constants"
import { env } from "@/lib/env"

const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

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
}

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
