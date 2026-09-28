import type { Metadata } from "next";

import { env } from "@/lib/env";

import { AnnouncementBar } from "@/features/website/components/announcement-bar";
import { BackToTop } from "@/features/website/components/back-to-top";
import { ScrollProgress } from "@/features/website/components/scroll-progress";
import { SiteFooter } from "@/features/website/components/site-footer";
import { SiteHeader } from "@/features/website/components/site-header";

export const metadata: Metadata = {
  title: {
    default: `${env.NEXT_PUBLIC_SITE_NAME} — Software Development & Digital Marketing`,
    template: `%s | ${env.NEXT_PUBLIC_SITE_NAME}`,
  },
  description:
    "DTR - Dream To Real builds web software and grows it with SEO, AIO, AEO and GEO. Development and digital marketing under one roof.",
  openGraph: {
    type: "website",
    siteName: env.NEXT_PUBLIC_SITE_NAME,
    title: `${env.NEXT_PUBLIC_SITE_NAME} — Software Development & Digital Marketing`,
    description:
      "Web & software development, SEO, and AI search optimization from a single studio.",
  },
};

export default function WebsiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <ScrollProgress />
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <BackToTop />
    </div>
  );
}
