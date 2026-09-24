import { isPathAllowed } from "../../lib/robots";
import { getHostVariants, getOrigin } from "../../lib/url";
import type { CheckContext, CheckResult } from "../types";

const IMPORTANT_PATH_HINTS = [
  "/",
  "/about",
  "/contact",
  "/products",
  "/services",
  "/blog",
  "/pricing",
  "/shop",
  "/search",
];

const ASSET_PATH_HINTS = [
  "/css/",
  "/js/",
  "/javascript/",
  "/scripts/",
  "/assets/",
  "/static/",
  "/images/",
  "/img/",
  "/fonts/",
  "/_next/",
];

export async function robotsTxtCheck(
  context: CheckContext
): Promise<CheckResult> {
  const robotsUrl = `${context.origin}/robots.txt`;
  const response = await context.fetchPage(robotsUrl);

  if (response.status === 404 || response.status === 0) {
    return {
      status: "warning",
      message: "No robots.txt file was found",
      evidence: { robotsUrl, status: response.status, error: response.error },
    };
  }

  if (!response.ok) {
    return {
      status: "warning",
      message: `robots.txt returned HTTP ${response.status}`,
      evidence: { robotsUrl, status: response.status },
    };
  }

  const robots = await context.getRobots();
  if (!robots) {
    return {
      status: "warning",
      message: "robots.txt could not be parsed",
      evidence: { robotsUrl },
    };
  }

  const blockedImportant: string[] = [];
  for (const path of IMPORTANT_PATH_HINTS) {
    if (!isPathAllowed(robots, path, "*")) blockedImportant.push(path);
  }

  const blockedAssets = ASSET_PATH_HINTS.filter(
    (path) => !isPathAllowed(robots, path, "*")
  );

  const crawl = await context.getCrawl();
  const blockedCrawledPages = crawl.pages
    .map((page) => new URL(page.url).pathname)
    .filter((path) => !isPathAllowed(robots, path, "*"));

  const issues = {
    blockedImportant,
    blockedAssets,
    blockedCrawledPages,
    groupCount: robots.groups.length,
    sitemaps: robots.sitemaps,
  };

  if (blockedImportant.length > 0) {
    return {
      status: "failed",
      message: `${blockedImportant.length} important path(s) are blocked in robots.txt`,
      evidence: issues,
    };
  }

  if (blockedAssets.length > 0 || blockedCrawledPages.length > 0) {
    return {
      status: "warning",
      message: "robots.txt blocks asset or crawled page paths",
      evidence: issues,
    };
  }

  return {
    status: "passed",
    message: "robots.txt does not block important paths",
    evidence: issues,
  };
}

export async function sitemapCheck(
  context: CheckContext
): Promise<CheckResult> {
  const sitemap = await context.getSitemap();

  if (!sitemap) {
    return {
      status: "failed",
      message: "No XML sitemap could be found or parsed",
      evidence: { siteUrl: context.siteUrl },
    };
  }

  const entriesWithLastmod = sitemap.entries.filter((e) => e.lastmod).length;

  if (sitemap.entries.length === 0) {
    return {
      status: "failed",
      message: "Sitemap was found but contains no URLs",
      evidence: { sitemapUrl: sitemap.url, errors: sitemap.errors },
    };
  }

  return {
    status: "passed",
    message: `Sitemap is valid with ${sitemap.entries.length} URLs`,
    evidence: {
      sitemapUrl: sitemap.url,
      isIndex: sitemap.isIndex,
      urlCount: sitemap.entries.length,
      entriesWithLastmod,
      errors: sitemap.errors,
    },
  };
}

export async function sitemapUrlsStatusCheck(
  context: CheckContext
): Promise<CheckResult> {
  const sitemap = await context.getSitemap();
  if (!sitemap || sitemap.entries.length === 0) {
    return {
      status: "skipped",
      message: "No sitemap URLs available to verify",
    };
  }

  const crawl = await context.getCrawl();
  const statusMap = new Map(
    crawl.linkStatuses.map((link) => [link.url, link.status])
  );
  for (const page of crawl.pages) statusMap.set(page.url, page.status);

  const sample = sitemap.entries.slice(0, 30);
  const broken: Array<{ url: string; status: number }> = [];

  for (const entry of sample) {
    const known = statusMap.get(entry.loc);
    if (known !== undefined) {
      if (known >= 400 || known === 0) {
        broken.push({ url: entry.loc, status: known });
      }
      continue;
    }
    const response = await context.fetchPage(entry.loc);
    if (!response.ok) {
      broken.push({ url: entry.loc, status: response.status });
    }
  }

  if (broken.length > 0) {
    return {
      status: "failed",
      message: `${broken.length} sitemap URL(s) do not return 200`,
      evidence: { checked: sample.length, broken },
    };
  }

  return {
    status: "passed",
    message: `All ${sample.length} sampled sitemap URLs return 200`,
    evidence: { checked: sample.length },
  };
}

export async function sitemapFreshnessCheck(
  context: CheckContext
): Promise<CheckResult> {
  const sitemap = await context.getSitemap();
  if (!sitemap || sitemap.entries.length === 0) {
    return { status: "skipped", message: "No sitemap URLs available" };
  }

  const missingLastmod = sitemap.entries.filter((e) => !e.lastmod).length;
  const stale: string[] = [];
  const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;

  for (const entry of sitemap.entries) {
    if (!entry.lastmod) continue;
    const parsed = Date.parse(entry.lastmod);
    if (!Number.isNaN(parsed) && parsed < oneYearAgo) {
      stale.push(entry.loc);
    }
  }

  if (stale.length > 0) {
    return {
      status: "warning",
      message: `${stale.length} sitemap URL(s) have lastmod older than a year`,
      evidence: { stale: stale.slice(0, 20), missingLastmod },
    };
  }

  if (missingLastmod > 0) {
    return {
      status: "warning",
      message: `${missingLastmod} sitemap URL(s) are missing lastmod`,
      evidence: { missingLastmod },
    };
  }

  return {
    status: "passed",
    message: "Sitemap lastmod values are present and fresh",
  };
}

export async function brokenInternalLinksCheck(
  context: CheckContext
): Promise<CheckResult> {
  const crawl = await context.getCrawl();
  const broken = crawl.linkStatuses.filter(
    (link) => !link.ok && (link.status >= 400 || link.status === 0)
  );

  if (broken.length > 0) {
    return {
      status: "failed",
      message: `${broken.length} internal link(s) are broken`,
      evidence: {
        broken: broken.slice(0, 30),
        totalChecked: crawl.linkStatuses.length,
      },
    };
  }

  return {
    status: "passed",
    message: `All ${crawl.linkStatuses.length} checked internal links resolve`,
    evidence: { totalChecked: crawl.linkStatuses.length },
  };
}

export async function redirectChainsCheck(
  context: CheckContext
): Promise<CheckResult> {
  const crawl = await context.getCrawl();
  const chains = crawl.pages.filter(
    (page) => page.redirectCount > 1 || page.loopDetected
  );

  if (chains.length > 0) {
    return {
      status: "warning",
      message: `${chains.length} page(s) use redirect chains or loops`,
      evidence: {
        chains: chains.map((page) => ({
          url: page.url,
          redirectCount: page.redirectCount,
          loopDetected: page.loopDetected,
        })),
      },
    };
  }

  return {
    status: "passed",
    message: "No redirect chains or loops detected during crawl",
  };
}

export async function orphanPagesCheck(
  context: CheckContext
): Promise<CheckResult> {
  const sitemap = await context.getSitemap();
  const crawl = await context.getCrawl();

  const linked = new Set(crawl.edges.map((edge) => edge.to));
  const sitemapUrls = sitemap?.entries.map((entry) => entry.loc) ?? [];

  const orphaned = sitemapUrls.filter(
    (url) => !linked.has(url) && url !== crawl.rootUrl
  );

  if (orphaned.length > 0) {
    return {
      status: "warning",
      message: `${orphaned.length} sitemap page(s) have no internal links`,
      evidence: { orphaned: orphaned.slice(0, 30) },
    };
  }

  return {
    status: "passed",
    message: "No orphan pages detected between sitemap and internal links",
    evidence: { sitemapUrls: sitemapUrls.length },
  };
}

export async function clickDepthCheck(
  context: CheckContext
): Promise<CheckResult> {
  const crawl = await context.getCrawl();
  const maxDepth = 3;
  const deep = crawl.pages
    .filter((page) => page.depth > maxDepth)
    .map((page) => ({ url: page.url, depth: page.depth }));

  if (deep.length > 0) {
    return {
      status: "warning",
      message: `${deep.length} page(s) are more than ${maxDepth} clicks from the homepage`,
      evidence: { deep: deep.slice(0, 30), maxDepth },
    };
  }

  return {
    status: "passed",
    message: `All crawled pages are within ${maxDepth} clicks of the homepage`,
    evidence: { crawled: crawl.pages.length },
  };
}

export async function duplicateContentCheck(
  context: CheckContext
): Promise<CheckResult> {
  const crawl = await context.getCrawl();
  const clusters = new Map<string, string[]>();

  for (const page of crawl.pages) {
    if (!page.contentHash) continue;
    const existing = clusters.get(page.contentHash) ?? [];
    existing.push(page.url);
    clusters.set(page.contentHash, existing);
  }

  const duplicates = [...clusters.values()].filter((urls) => urls.length > 1);

  if (duplicates.length > 0) {
    return {
      status: "warning",
      message: `${duplicates.length} set(s) of near-identical pages detected`,
      evidence: { duplicates: duplicates.slice(0, 10) },
    };
  }

  return {
    status: "passed",
    message: "No duplicate page content detected in the crawl",
    evidence: { pages: crawl.pages.length },
  };
}

export async function sitemapVsCrawledCheck(
  context: CheckContext
): Promise<CheckResult> {
  const sitemap = await context.getSitemap();
  if (!sitemap) {
    return { status: "skipped", message: "No sitemap available to compare" };
  }

  const crawl = await context.getCrawl();
  const indexable = crawl.pages.filter((page) => page.ok).length;
  const sitemapCount = sitemap.entries.length;
  const difference = Math.abs(sitemapCount - indexable);

  if (difference > Math.max(5, indexable * 0.5)) {
    return {
      status: "warning",
      message: "Sitemap URL count differs significantly from crawled pages",
      evidence: { sitemapCount, indexable, difference },
    };
  }

  return {
    status: "passed",
    message: "Sitemap URL count roughly matches crawled indexable pages",
    evidence: { sitemapCount, indexable, difference },
  };
}

export async function hostnameProtocolCheck(
  context: CheckContext
): Promise<CheckResult> {
  const variants = getHostVariants(context.siteUrl);
  if (!variants) {
    return {
      status: "error",
      message: "Could not derive host variants from the site URL",
    };
  }

  const expectedOrigin = getOrigin(context.siteUrl);
  const results: Array<{ url: string; finalUrl: string; status: number }> = [];

  for (const url of [variants.httpsWww, variants.httpsNonWww]) {
    const response = await context.fetchPage(url);
    results.push({
      url,
      finalUrl: response.finalUrl,
      status: response.status,
    });
  }

  const inconsistent = results.filter(
    (result) => getOrigin(result.finalUrl) !== expectedOrigin
  );

  if (inconsistent.length > 0) {
    return {
      status: "warning",
      message:
        "www / non-www variants do not resolve to a single canonical host",
      evidence: { expectedOrigin, results, inconsistent },
    };
  }

  return {
    status: "passed",
    message: "Hostname variants resolve consistently",
    evidence: { expectedOrigin, results },
  };
}
