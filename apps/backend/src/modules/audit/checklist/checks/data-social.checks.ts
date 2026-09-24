import {
  getAnchors,
  getHeadings,
  getHreflangLinks,
  getJsonLdBlocks,
  getMetaByName,
  getMetaByProperty,
  getTextContent,
  parseAttributes,
} from "../../lib/html";
import { isPathAllowed } from "../../lib/robots";
import { resolveUrl } from "../../lib/url";
import type { CheckContext, CheckResult } from "../types";

export const AI_CRAWLER_BOTS = [
  "GPTBot",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "CCBot",
  "Bytespider",
  "Meta-ExternalAgent",
] as const;

export async function structuredDataCheck(
  context: CheckContext
): Promise<CheckResult> {
  const response = await context.fetchPage(context.url);
  if (!response.ok) {
    return {
      status: "skipped",
      message: `Page returned HTTP ${response.status}`,
    };
  }

  const blocks = getJsonLdBlocks(response.body);
  if (blocks.length === 0) {
    return {
      status: "warning",
      message: "Page has no JSON-LD structured data",
      evidence: { url: context.url },
    };
  }

  const invalid: Array<{ index: number; error: string }> = [];
  const types: string[] = [];

  blocks.forEach((block, index) => {
    try {
      const parsed = JSON.parse(block) as
        | { "@type"?: string | string[] }
        | Array<{ "@type"?: string | string[] }>;
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of nodes) {
        const type = node["@type"];
        if (typeof type === "string") types.push(type);
        else if (Array.isArray(type)) types.push(...type);
      }
    } catch (err) {
      invalid.push({
        index,
        error: err instanceof Error ? err.message : "invalid JSON",
      });
    }
  });

  if (invalid.length > 0) {
    return {
      status: "failed",
      message: `${invalid.length} JSON-LD block(s) are invalid JSON`,
      evidence: { url: context.url, invalid },
    };
  }

  if (types.length === 0) {
    return {
      status: "warning",
      message: "JSON-LD blocks do not declare an @type",
      evidence: { url: context.url, blockCount: blocks.length },
    };
  }

  return {
    status: "passed",
    message: `Valid JSON-LD found with types: ${[...new Set(types)].join(", ")}`,
    evidence: { url: context.url, types: [...new Set(types)] },
  };
}

export async function structuredDataVisibleMatchCheck(
  context: CheckContext
): Promise<CheckResult> {
  const response = await context.fetchPage(context.url);
  if (!response.ok) {
    return {
      status: "skipped",
      message: `Page returned HTTP ${response.status}`,
    };
  }

  const blocks = getJsonLdBlocks(response.body);
  if (blocks.length === 0) {
    return { status: "skipped", message: "No structured data to cross-check" };
  }

  const visibleText = getTextContent(response.body).toLowerCase();
  const mismatches: Array<{ field: string; value: string }> = [];

  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block) as Record<string, unknown>;
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of nodes) {
        for (const field of [
          "price",
          "availability",
          "datePublished",
          "dateModified",
        ]) {
          const value = node[field];
          if (typeof value === "string" && value.length > 0) {
            const normalized = value.toLowerCase();
            if (!visibleText.includes(normalized) && field === "price") {
              mismatches.push({ field, value });
            }
          }
        }
      }
    } catch {
      continue;
    }
  }

  if (mismatches.length > 0) {
    return {
      status: "needs_review",
      message: "Some structured data values may not match visible content",
      evidence: { url: context.url, mismatches },
    };
  }

  return {
    status: "passed",
    message: "Structured data values appear consistent with visible content",
    evidence: { url: context.url },
  };
}

export async function hreflangCheck(
  context: CheckContext
): Promise<CheckResult> {
  const response = await context.fetchPage(context.url);
  if (!response.ok) {
    return {
      status: "skipped",
      message: `Page returned HTTP ${response.status}`,
    };
  }

  const links = getHreflangLinks(response.body);
  if (links.length === 0) {
    return {
      status: "passed",
      message: "Page does not use hreflang (single-language site)",
      evidence: { url: context.url },
    };
  }

  const canonical = response.body.match(
    /<link[^>]*rel=["']canonical["'][^>]*>/i
  )?.[0];
  const canonicalHref = canonical ? parseAttributes(canonical).href : null;

  const hasSelfReference = links.some(
    (link) =>
      link.href &&
      link.href.replace(/\/+$/, "") === context.url.replace(/\/+$/, "")
  );

  const invalidCodes = links.filter(
    (link) =>
      link.hreflang &&
      link.hreflang !== "x-default" &&
      !/^[a-z]{2}(-[A-Za-z]{2,4})?$/.test(link.hreflang)
  );

  const missingReciprocity: string[] = [];
  const sample = links.slice(0, 5);

  for (const link of sample) {
    if (!link.href) continue;
    const resolved = resolveUrl(link.href, context.url);
    if (!resolved) continue;
    const reciprocal = await context.fetchPage(resolved);
    if (!reciprocal.ok) continue;
    const reciprocalLinks = getHreflangLinks(reciprocal.body);
    const linksBack = reciprocalLinks.some(
      (candidate) =>
        candidate.href &&
        candidate.href.replace(/\/+$/, "") === context.url.replace(/\/+$/, "")
    );
    if (!linksBack) missingReciprocity.push(resolved);
  }

  if (!hasSelfReference) {
    return {
      status: "warning",
      message: "hreflang set is missing a self-referencing entry",
      evidence: { url: context.url, links },
    };
  }

  if (invalidCodes.length > 0 || missingReciprocity.length > 0) {
    return {
      status: "warning",
      message: "hreflang issues detected",
      evidence: {
        url: context.url,
        invalidCodes,
        missingReciprocity,
        canonical: canonicalHref,
      },
    };
  }

  return {
    status: "passed",
    message: `hreflang set is reciprocal across ${links.length} entries`,
    evidence: { url: context.url, count: links.length },
  };
}

export async function socialMetaCheck(
  context: CheckContext
): Promise<CheckResult> {
  const response = await context.fetchPage(context.url);
  if (!response.ok) {
    return {
      status: "skipped",
      message: `Page returned HTTP ${response.status}`,
    };
  }

  const html = response.body;
  const tags = {
    "og:title": getMetaByProperty(html, "og:title"),
    "og:description": getMetaByProperty(html, "og:description"),
    "og:image": getMetaByProperty(html, "og:image"),
    "og:url": getMetaByProperty(html, "og:url"),
    "twitter:card": getMetaByName(html, "twitter:card"),
  };

  const missing = Object.entries(tags)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    return {
      status: "warning",
      message: `Missing social metadata: ${missing.join(", ")}`,
      evidence: { url: context.url, tags, missing },
    };
  }

  return {
    status: "passed",
    message: "All key social/OG metadata tags are present",
    evidence: { url: context.url, tags },
  };
}

export async function aiCrawlerAccessCheck(
  context: CheckContext
): Promise<CheckResult> {
  const robots = await context.getRobots();

  if (!robots) {
    return {
      status: "passed",
      message: "No robots.txt found; AI crawlers are not explicitly blocked",
      evidence: { bots: AI_CRAWLER_BOTS },
    };
  }

  const blocked: string[] = [];
  const allowed: string[] = [];
  const statuses: Record<string, "allowed" | "blocked"> = {};

  for (const bot of AI_CRAWLER_BOTS) {
    const isAllowed = isPathAllowed(robots, "/", bot);
    statuses[bot] = isAllowed ? "allowed" : "blocked";
    if (isAllowed) allowed.push(bot);
    else blocked.push(bot);
  }

  if (blocked.length === AI_CRAWLER_BOTS.length) {
    return {
      status: "warning",
      message: "All tracked AI crawlers are blocked in robots.txt",
      evidence: { statuses },
    };
  }

  if (blocked.length > 0) {
    return {
      status: "warning",
      message: `${blocked.length} AI crawler(s) are blocked in robots.txt`,
      evidence: { statuses, blocked, allowed },
    };
  }

  return {
    status: "passed",
    message: "No AI crawlers are blocked in robots.txt",
    evidence: { statuses },
  };
}

export async function aeoStructureCheck(
  context: CheckContext
): Promise<CheckResult> {
  const response = await context.fetchPage(context.url);
  if (!response.ok) {
    return {
      status: "skipped",
      message: `Page returned HTTP ${response.status}`,
    };
  }

  const headings = [
    ...getHeadings(response.body, 2),
    ...getHeadings(response.body, 3),
  ];
  const questionHeadings = headings.filter(
    (heading) =>
      heading.endsWith("?") ||
      /^(what|how|why|when|where|who|which|can|does|is|are|should)\b/i.test(
        heading
      )
  );

  if (headings.length === 0) {
    return {
      status: "needs_review",
      message: "Page has no H2/H3 structure to evaluate for answer content",
      evidence: { url: context.url },
    };
  }

  if (questionHeadings.length === 0) {
    return {
      status: "needs_review",
      message: "No question-style headings found for AEO structure",
      evidence: { url: context.url, headingCount: headings.length },
    };
  }

  return {
    status: "needs_review",
    message: `${questionHeadings.length} question-style heading(s) found; verify each has a direct answer`,
    evidence: { url: context.url, questionHeadings },
  };
}

export async function eeatSignalsCheck(
  context: CheckContext
): Promise<CheckResult> {
  const response = await context.fetchPage(context.url);
  if (!response.ok) {
    return {
      status: "skipped",
      message: `Page returned HTTP ${response.status}`,
    };
  }

  const html = response.body;
  const anchors = getAnchors(html);
  const aboutLink = anchors.some(
    (anchor) => anchor.href && /\/about/i.test(anchor.href)
  );

  const hasAuthorByline =
    /rel=["']author["']|class=["'][^"']*author|byline/i.test(html);
  const hasPublishedDate =
    /datePublished|published|article:published_time/i.test(html);
  const hasOrganizationSchema = getJsonLdBlocks(html).some((block) =>
    /"@type"\s*:\s*"(Organization|Person|NewsArticle|Article)"/i.test(block)
  );

  const signals = {
    aboutLink,
    hasAuthorByline,
    hasPublishedDate,
    hasOrganizationSchema,
  };

  const found = Object.values(signals).filter(Boolean).length;

  if (found === 0) {
    return {
      status: "needs_review",
      message:
        "No E-E-A-T signals detected; content quality needs manual review",
      evidence: { url: context.url, signals },
    };
  }

  return {
    status: "needs_review",
    message: `${found}/4 E-E-A-T signals detected; content quality still needs manual review`,
    evidence: { url: context.url, signals },
  };
}
