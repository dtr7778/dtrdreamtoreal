import { describe, expect, it } from "vitest";

import { parseSitemapXml } from "./sitemap";

describe("parseSitemapXml", () => {
  it("parses a urlset with lastmod", () => {
    const xml = `<?xml version="1.0"?>
<urlset>
  <url><loc>https://example.com/a</loc><lastmod>2026-01-01</lastmod></url>
  <url><loc>https://example.com/b</loc></url>
</urlset>`;

    const result = parseSitemapXml(xml);
    expect(result.isIndex).toBe(false);
    expect(result.entries).toEqual([
      { loc: "https://example.com/a", lastmod: "2026-01-01" },
      { loc: "https://example.com/b", lastmod: null },
    ]);
  });

  it("detects a sitemap index", () => {
    const xml = `<sitemapindex>
  <sitemap><loc>https://example.com/sitemap-1.xml</loc></sitemap>
</sitemapindex>`;

    const result = parseSitemapXml(xml);
    expect(result.isIndex).toBe(true);
    expect(result.entries[0]?.loc).toBe("https://example.com/sitemap-1.xml");
  });
});
