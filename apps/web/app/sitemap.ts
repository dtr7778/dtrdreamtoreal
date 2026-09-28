import type { MetadataRoute } from "next";

import { env } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = env.NEXT_PUBLIC_SITE_URL;
  const lastModified = new Date();

  const pages: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "", changeFrequency: "monthly", priority: 1 },
    { path: "/services", changeFrequency: "monthly", priority: 0.9 },
    { path: "/about", changeFrequency: "yearly", priority: 0.7 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.8 },
    { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms-and-conditions", changeFrequency: "yearly", priority: 0.3 },
    { path: "/login", changeFrequency: "monthly", priority: 0.5 },
    { path: "/register", changeFrequency: "monthly", priority: 0.5 },
    { path: "/forget-password", changeFrequency: "monthly", priority: 0.5 },
  ];

  return pages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
