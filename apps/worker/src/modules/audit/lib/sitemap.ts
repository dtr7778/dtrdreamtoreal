import { httpFetch } from "./http";

export interface SitemapEntry {
  loc: string;
  lastmod: string | null;
}

export interface SitemapResult {
  url: string;
  isIndex: boolean;
  entries: SitemapEntry[];
  errors: string[];
  fetched: number;
}

function extractTag(block: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = regex.exec(block);
  if (!match || !match[1]) return null;
  return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function extractBlocks(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?</${tag}>`, "gi");
  return xml.match(regex) ?? [];
}

export function parseSitemapXml(xml: string): {
  isIndex: boolean;
  entries: SitemapEntry[];
} {
  const isIndex = /<sitemapindex[\s>]/i.test(xml);
  const blockTag = isIndex ? "sitemap" : "url";
  const blocks = extractBlocks(xml, blockTag);

  const entries: SitemapEntry[] = [];
  for (const block of blocks) {
    const loc = extractTag(block, "loc");
    if (!loc) continue;
    entries.push({ loc, lastmod: extractTag(block, "lastmod") });
  }

  return { isIndex, entries };
}

/**
 * Fetch a sitemap (or sitemap index) and return all page URLs it declares.
 * Sitemap indexes are followed one level deep, capped by `maxSitemaps`.
 */
export async function fetchSitemapUrls(
  sitemapUrl: string,
  options: { maxSitemaps?: number } = {}
): Promise<SitemapResult> {
  const maxSitemaps = options.maxSitemaps ?? 5;
  const result: SitemapResult = {
    url: sitemapUrl,
    isIndex: false,
    entries: [],
    errors: [],
    fetched: 0,
  };

  const queue = [sitemapUrl];
  const seen = new Set<string>();

  while (queue.length > 0 && result.fetched < maxSitemaps) {
    const current = queue.shift();
    if (!current || seen.has(current)) continue;
    seen.add(current);

    const response = await httpFetch(current, { timeoutMs: 15_000 });
    result.fetched += 1;

    if (response.error) {
      result.errors.push(`${current}: ${response.error}`);
      continue;
    }
    if (!response.ok) {
      result.errors.push(`${current}: HTTP ${response.status}`);
      continue;
    }

    const parsed = parseSitemapXml(response.body);
    if (parsed.isIndex) {
      result.isIndex = true;
      for (const entry of parsed.entries) {
        if (!seen.has(entry.loc)) queue.push(entry.loc);
      }
    } else {
      result.entries.push(...parsed.entries);
    }
  }

  return result;
}
