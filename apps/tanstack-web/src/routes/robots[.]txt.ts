import { env } from "#/lib/env";
import { createFileRoute } from "@tanstack/react-router";

type RobotsRule = {
  userAgent?: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
  crawlDelay?: number;
};

type RobotsOptions = {
  rules: RobotsRule | RobotsRule[];
  sitemap?: string | string[];
  host?: string;
};

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function makeRobotsTxt({ rules, sitemap, host }: RobotsOptions): string {
  const blocks: string[] = [];

  for (const rule of toArray(rules)) {
    const lines: string[] = [];

    const agents = toArray(rule.userAgent);
    if (agents.length === 0) {
      lines.push("User-agent: *");
    } else {
      for (const agent of agents) {
        lines.push(`User-agent: ${agent}`);
      }
    }

    for (const path of toArray(rule.allow)) {
      lines.push(`Allow: ${path}`);
    }
    for (const path of toArray(rule.disallow)) {
      lines.push(`Disallow: ${path}`);
    }
    if (rule.crawlDelay !== undefined) {
      lines.push(`Crawl-delay: ${rule.crawlDelay}`);
    }

    blocks.push(lines.join("\n"));
  }

  for (const url of toArray(sitemap)) {
    blocks.push(`Sitemap: ${url}`);
  }

  if (host) {
    blocks.push(`Host: ${host}`);
  }

  return blocks.join("\n\n") + "\n";
}

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => {
        const baseUrl = env.VITE_SITE_URL.replace(/\/$/, "");

        return new Response(
          makeRobotsTxt({
            rules: [
              {
                userAgent: "*",
                allow: "/",
              },
            ],
            sitemap: `${baseUrl}/sitemap.xml`,
            host: baseUrl,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
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
