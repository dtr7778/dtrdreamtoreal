import { createHash } from "node:crypto";

import { getAnchors, getTextContent, getTitle, getWordCount } from "./html";
import { httpFetch } from "./http";
import { getUrlDepth, isInternalLink, normalizeUrl, resolveUrl } from "./url";

export interface CrawlPage {
  url: string;
  finalUrl: string;
  status: number;
  ok: boolean;
  depth: number;
  title: string | null;
  wordCount: number;
  contentHash: string;
  redirectCount: number;
  loopDetected: boolean;
  internalLinks: string[];
  externalLinkCount: number;
}

export interface CrawlEdge {
  from: string;
  to: string;
}

export interface CrawlLinkStatus {
  url: string;
  status: number;
  ok: boolean;
  error: string | null;
}

export interface CrawlResult {
  rootUrl: string;
  origin: string;
  pages: CrawlPage[];
  edges: CrawlEdge[];
  linkStatuses: CrawlLinkStatus[];
  orphanCandidates: string[];
  depthMap: Record<string, number>;
  truncated: boolean;
  durationMs: number;
  errors: string[];
}

export interface CrawlOptions {
  maxPages?: number;
  maxDepth?: number;
  maxLinkChecks?: number;
  timeoutMs?: number;
}

const DEFAULT_MAX_PAGES = 25;
const DEFAULT_MAX_DEPTH = 3;
const DEFAULT_MAX_LINK_CHECKS = 40;

function hashContent(html: string): string {
  return createHash("sha1")
    .update(getTextContent(html))
    .digest("hex")
    .slice(0, 16);
}

export async function crawlSite(
  rootUrl: string,
  options: CrawlOptions = {}
): Promise<CrawlResult> {
  const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES;
  const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
  const maxLinkChecks = options.maxLinkChecks ?? DEFAULT_MAX_LINK_CHECKS;
  const timeoutMs = options.timeoutMs ?? 15_000;

  const startedAt = Date.now();
  const normalizedRoot = normalizeUrl(rootUrl);
  const origin = new URL(normalizedRoot).origin;

  const pages: CrawlPage[] = [];
  const edges: CrawlEdge[] = [];
  const errors: string[] = [];
  const visited = new Set<string>();
  const queued = new Set<string>([normalizedRoot]);
  const allInternalLinks = new Set<string>();

  const queue: Array<{ url: string; depth: number }> = [
    { url: normalizedRoot, depth: 0 },
  ];

  let truncated = false;

  while (queue.length > 0) {
    if (pages.length >= maxPages) {
      truncated = true;
      break;
    }

    const current = queue.shift();
    if (!current) break;

    const url = normalizeUrl(current.url);
    if (visited.has(url)) continue;
    visited.add(url);

    const response = await httpFetch(url, { timeoutMs });

    if (response.error) {
      errors.push(`${url}: ${response.error}`);
      pages.push({
        url,
        finalUrl: response.finalUrl,
        status: response.status,
        ok: false,
        depth: current.depth,
        title: null,
        wordCount: 0,
        contentHash: "",
        redirectCount: response.redirectCount,
        loopDetected: response.loopDetected,
        internalLinks: [],
        externalLinkCount: 0,
      });
      continue;
    }

    const html = response.body;
    const internalLinks: string[] = [];
    let externalLinkCount = 0;
    const anchorList = getAnchors(html);

    for (const anchor of anchorList) {
      const href = anchor.href;
      if (!href || !isInternalLink(href, origin)) {
        if (href && !href.startsWith("#")) externalLinkCount += 1;
        continue;
      }
      const resolved = resolveUrl(href, response.finalUrl || url);
      if (!resolved) continue;
      const normalized = normalizeUrl(resolved);
      internalLinks.push(normalized);
      allInternalLinks.add(normalized);
      edges.push({ from: url, to: normalized });
    }

    const uniqueInternalLinks = [...new Set(internalLinks)];

    pages.push({
      url,
      finalUrl: response.finalUrl,
      status: response.status,
      ok: response.ok,
      depth: current.depth,
      title: getTitle(html),
      wordCount: getWordCount(html),
      contentHash: hashContent(html),
      redirectCount: response.redirectCount,
      loopDetected: response.loopDetected,
      internalLinks: uniqueInternalLinks,
      externalLinkCount,
    });

    if (current.depth >= maxDepth) continue;

    for (const link of uniqueInternalLinks) {
      if (visited.has(link) || queued.has(link)) continue;
      if (getUrlDepth(link) < getUrlDepth(url) - 1) continue;
      queued.add(link);
      queue.push({ url: link, depth: current.depth + 1 });
    }
  }

  if (queue.length > 0) truncated = true;

  const crawledUrls = new Set(pages.map((page) => page.url));
  const unchecked = [...allInternalLinks].filter(
    (link) => !crawledUrls.has(link)
  );
  const linkStatuses: CrawlLinkStatus[] = [];

  for (const page of pages) {
    linkStatuses.push({
      url: page.url,
      status: page.status,
      ok: page.ok,
      error: null,
    });
  }

  const toCheck = unchecked.slice(0, maxLinkChecks);
  for (const link of toCheck) {
    const response = await httpFetch(link, { method: "HEAD", timeoutMs });
    linkStatuses.push({
      url: link,
      status: response.status,
      ok: response.ok,
      error: response.error,
    });
  }

  const depthMap: Record<string, number> = {};
  for (const page of pages) {
    depthMap[page.url] = page.depth;
  }

  const linkedUrls = new Set(edges.map((edge) => edge.to));
  const orphanCandidates = pages
    .map((page) => page.url)
    .filter((url) => url !== normalizedRoot && !linkedUrls.has(url));

  return {
    rootUrl: normalizedRoot,
    origin,
    pages,
    edges,
    linkStatuses,
    orphanCandidates,
    depthMap,
    truncated,
    durationMs: Date.now() - startedAt,
    errors,
  };
}
