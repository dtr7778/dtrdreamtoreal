import { env } from "#/lib/env";
import { createFileRoute } from "@tanstack/react-router";

type ChangeFrequency =
  "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

type SitemapEntry = {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
};

const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => XML_ESCAPES[char] ?? char);
}

function toIsoDate(value: string | Date): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function makeSitemap(
  urls: Array<{
    url: string;
    lastModified?: string | Date;
    changeFrequency?: ChangeFrequency;
    priority?: number;
  }>
): string {
  const entries = urls.map(
    ({ url, lastModified, changeFrequency, priority }) => {
      const parts = [`<loc>${escapeXml(url)}</loc>`];

      if (lastModified) {
        parts.push(`<lastmod>${toIsoDate(lastModified)}</lastmod>`);
      }
      if (changeFrequency) {
        parts.push(`<changefreq>${changeFrequency}</changefreq>`);
      }
      if (priority !== undefined) {
        parts.push(`<priority>${priority.toFixed(1)}</priority>`);
      }

      return `<url>${parts.join("")}</url>`;
    }
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries.join("\n"),
    "</urlset>",
  ].join("\n");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const now = new Date();
        const baseUrl = env.VITE_SITE_URL.replace(/\/$/, "");

        const SITE_PAGES: readonly SitemapEntry[] = [
          { path: "", changeFrequency: "monthly", priority: 1 },
          { path: "/services", changeFrequency: "monthly", priority: 0.9 },
          { path: "/about", changeFrequency: "yearly", priority: 0.7 },
          { path: "/contact", changeFrequency: "yearly", priority: 0.8 },
          { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
          {
            path: "/terms-and-conditions",
            changeFrequency: "yearly",
            priority: 0.3,
          },
        ];

        return new Response(
          makeSitemap(
            SITE_PAGES.map(({ path, changeFrequency, priority }) => ({
              url: `${baseUrl}${path}`,
              lastModified: now,
              changeFrequency,
              priority,
            }))
          ),
          {
            status: 200,
            headers: {
              "Content-Type": "application/xml; charset=utf-8",
              "X-Content-Type-Options": "nosniff",
              "Cache-Control":
                "public, max-age=3600, stale-while-revalidate=3600",
            },
          }
        );
      },
    },
  },
});
