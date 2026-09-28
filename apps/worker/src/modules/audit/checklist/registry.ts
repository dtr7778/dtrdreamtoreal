import {
  brokenInternalLinksCheck,
  clickDepthCheck,
  duplicateContentCheck,
  hostnameProtocolCheck,
  orphanPagesCheck,
  redirectChainsCheck,
  robotsTxtCheck,
  sitemapCheck,
  sitemapFreshnessCheck,
  sitemapUrlsStatusCheck,
  sitemapVsCrawledCheck,
} from "./checks/crawlability.checks";
import { coreWebVitalsCheck } from "./checks/cwv.checks";
import {
  aeoStructureCheck,
  aiCrawlerAccessCheck,
  eeatSignalsCheck,
  hreflangCheck,
  socialMetaCheck,
  structuredDataCheck,
  structuredDataVisibleMatchCheck,
} from "./checks/data-social.checks";
import {
  canonicalTagCheck,
  h1Check,
  metaRobotsCheck,
  soft404Check,
  thinContentCheck,
  titleCheck,
  xRobotsHeaderCheck,
} from "./checks/indexability.checks";
import {
  imageAltCheck,
  imageDimensionsCheck,
  imageLazyLoadingCheck,
  imageSrcsetCheck,
  jsRenderingCheck,
  viewportMetaCheck,
} from "./checks/media.checks";
import {
  genericAnchorTextCheck,
  hstsHeaderCheck,
  httpToHttpsRedirectCheck,
  mixedContentCheck,
  sslCertificateCheck,
  urlStructureCheck,
} from "./checks/url-security.checks";
import type { ChecklistItem } from "./types";

export const CHECKLIST_SECTIONS = [
  "Crawlability",
  "Indexability",
  "URL structure",
  "HTTPS & security",
  "Canonicalization",
  "Redirects & status codes",
  "Site architecture",
  "Mobile SEO",
  "JavaScript SEO / rendering",
  "Core Web Vitals & performance",
  "Image SEO",
  "Structured data",
  "International SEO",
  "Social/OG metadata",
  "AI crawler access (AIO/AEO)",
  "Answer-focused content / AEO structure",
  "E-E-A-T signals",
  "Content quality (manual review)",
] as const;

export const CHECKLIST: readonly ChecklistItem[] = [
  {
    key: "robots-txt",
    section: "Crawlability",
    title: "robots.txt is valid and does not block important paths",
    description:
      "Fetches and parses robots.txt, flagging disallow rules that block important pages or asset directories.",
    scope: "site",
    automation: "full",
    checkFn: robotsTxtCheck,
  },
  {
    key: "sitemap-valid",
    section: "Crawlability",
    title: "XML sitemap exists and is valid",
    description:
      "Locates the sitemap (via robots.txt or /sitemap.xml) and validates that it parses with URLs.",
    scope: "site",
    automation: "full",
    checkFn: sitemapCheck,
  },
  {
    key: "sitemap-urls-status",
    section: "Crawlability",
    title: "Sitemap URLs return HTTP 200",
    description:
      "Samples sitemap URLs and verifies each returns a successful status code.",
    scope: "site",
    automation: "full",
    checkFn: sitemapUrlsStatusCheck,
  },
  {
    key: "sitemap-freshness",
    section: "Crawlability",
    title: "Sitemap lastmod values are fresh",
    description:
      "Checks that sitemap entries declare lastmod and are not older than a year.",
    scope: "site",
    automation: "full",
    checkFn: sitemapFreshnessCheck,
  },
  {
    key: "broken-internal-links",
    section: "Crawlability",
    title: "No broken internal links",
    description:
      "Crawls the site and records 4xx/5xx responses for internal links.",
    scope: "site",
    automation: "full",
    checkFn: brokenInternalLinksCheck,
  },
  {
    key: "meta-robots",
    section: "Indexability",
    title: "Pages are not blocked by meta robots",
    description: "Detects meta robots noindex directives on crawled pages.",
    scope: "page",
    automation: "full",
    checkFn: metaRobotsCheck,
  },
  {
    key: "x-robots-tag",
    section: "Indexability",
    title: "X-Robots-Tag header does not block indexing",
    description: "Inspects the X-Robots-Tag response header for noindex.",
    scope: "page",
    automation: "full",
    checkFn: xRobotsHeaderCheck,
  },
  {
    key: "title-tag",
    section: "Indexability",
    title: "Title tag is present and well sized",
    description: "Validates presence and length of the page title.",
    scope: "page",
    automation: "full",
    checkFn: titleCheck,
  },
  {
    key: "h1-heading",
    section: "Indexability",
    title: "Page has a single H1",
    description: "Checks for exactly one H1 heading per page.",
    scope: "page",
    automation: "full",
    checkFn: h1Check,
  },
  {
    key: "thin-content",
    section: "Indexability",
    title: "Page is not thin content",
    description: "Flags pages with fewer than 300 words of content.",
    scope: "page",
    automation: "full",
    checkFn: thinContentCheck,
  },
  {
    key: "duplicate-content",
    section: "Indexability",
    title: "No duplicate page content",
    description:
      "Hashes crawled page content and clusters near-identical pages.",
    scope: "site",
    automation: "full",
    checkFn: duplicateContentCheck,
  },
  {
    key: "sitemap-vs-crawled",
    section: "Indexability",
    title: "Sitemap count matches crawled indexable pages",
    description:
      "Compares sitemap URL count against the number of indexable crawled pages.",
    scope: "site",
    automation: "full",
    checkFn: sitemapVsCrawledCheck,
  },
  {
    key: "url-structure",
    section: "URL structure",
    title: "URL follows structural best practices",
    description:
      "Lints URLs for uppercase, session IDs, excessive parameters/depth, trailing slashes and separators.",
    scope: "page",
    automation: "full",
    checkFn: urlStructureCheck,
  },
  {
    key: "hostname-protocol-consistency",
    section: "URL structure",
    title: "www / non-www resolve consistently",
    description:
      "Fetches hostname variants and confirms they resolve to one canonical host.",
    scope: "site",
    automation: "full",
    checkFn: hostnameProtocolCheck,
  },
  {
    key: "http-to-https-redirect",
    section: "HTTPS & security",
    title: "HTTP permanently redirects to HTTPS",
    description: "Fetches the HTTP variant and checks for a 301/308 to HTTPS.",
    scope: "page",
    automation: "full",
    checkFn: httpToHttpsRedirectCheck,
  },
  {
    key: "mixed-content",
    section: "HTTPS & security",
    title: "No mixed-content resources",
    description:
      "Scans HTTPS pages for http:// references in src/href attributes.",
    scope: "page",
    automation: "full",
    checkFn: mixedContentCheck,
  },
  {
    key: "ssl-certificate",
    section: "HTTPS & security",
    title: "TLS certificate is valid and not near expiry",
    description: "Performs a TLS handshake and inspects certificate validity.",
    scope: "site",
    automation: "full",
    checkFn: sslCertificateCheck,
  },
  {
    key: "hsts-header",
    section: "HTTPS & security",
    title: "HSTS header is present",
    description:
      "Checks for a Strict-Transport-Security header with a max-age directive.",
    scope: "site",
    automation: "full",
    checkFn: hstsHeaderCheck,
  },
  {
    key: "canonical-tag",
    section: "Canonicalization",
    title: "Canonical tag is absolute and self-referencing",
    description:
      "Extracts the canonical tag and checks it is absolute, self-referencing and not conflicting with noindex.",
    scope: "page",
    automation: "full",
    checkFn: canonicalTagCheck,
  },
  {
    key: "redirect-chains",
    section: "Redirects & status codes",
    title: "No redirect chains or loops",
    description:
      "Records redirect chain length during the crawl and flags chains or loops.",
    scope: "site",
    automation: "full",
    checkFn: redirectChainsCheck,
  },
  {
    key: "soft-404",
    section: "Redirects & status codes",
    title: "No soft 404s",
    description:
      "Detects pages that return 200 but show not-found style content.",
    scope: "page",
    automation: "full",
    checkFn: soft404Check,
  },
  {
    key: "click-depth",
    section: "Site architecture",
    title: "Pages are within 3 clicks of the homepage",
    description: "Computes click-depth from the crawl link graph.",
    scope: "site",
    automation: "full",
    checkFn: clickDepthCheck,
  },
  {
    key: "orphan-pages",
    section: "Site architecture",
    title: "No orphan pages",
    description:
      "Finds sitemap pages that are not linked from anywhere in the crawl.",
    scope: "site",
    automation: "full",
    checkFn: orphanPagesCheck,
  },
  {
    key: "generic-anchor-text",
    section: "Site architecture",
    title: "Internal links avoid generic anchor text",
    description:
      "Flags internal links using generic anchor text such as 'click here'.",
    scope: "page",
    automation: "full",
    checkFn: genericAnchorTextCheck,
  },
  {
    key: "viewport-meta",
    section: "Mobile SEO",
    title: "Viewport meta tag is configured",
    description:
      "Checks the viewport meta tag is present and sets width=device-width.",
    scope: "page",
    automation: "full",
    checkFn: viewportMetaCheck,
  },
  {
    key: "js-rendering",
    section: "JavaScript SEO / rendering",
    title: "Critical content is present without JavaScript",
    description:
      "Compares raw HTML content against expected rendered content; flags JS-dependent pages for AI crawler visibility.",
    scope: "page",
    automation: "semi",
    checkFn: jsRenderingCheck,
  },
  {
    key: "core-web-vitals",
    section: "Core Web Vitals & performance",
    title: "Core Web Vitals are in the good range",
    description:
      "Collects lab (PSI mobile + desktop) and field (CrUX) LCP/INP/CLS data.",
    scope: "page",
    automation: "full",
    maxPages: 3,
    checkFn: coreWebVitalsCheck,
  },
  {
    key: "image-alt",
    section: "Image SEO",
    title: "Images have alt text",
    description: "Checks all img tags for meaningful alt attributes.",
    scope: "page",
    automation: "full",
    checkFn: imageAltCheck,
  },
  {
    key: "image-dimensions",
    section: "Image SEO",
    title: "Images declare width and height",
    description: "Flags images missing width/height attributes.",
    scope: "page",
    automation: "full",
    checkFn: imageDimensionsCheck,
  },
  {
    key: "image-lazy-loading",
    section: "Image SEO",
    title: "Image loading strategy is correct",
    description: "Flags a lazy-loaded LCP image and excessive eager loading.",
    scope: "page",
    automation: "full",
    checkFn: imageLazyLoadingCheck,
  },
  {
    key: "image-srcset",
    section: "Image SEO",
    title: "Responsive images use srcset",
    description: "Checks images provide responsive srcset variants.",
    scope: "page",
    automation: "full",
    checkFn: imageSrcsetCheck,
  },
  {
    key: "structured-data",
    section: "Structured data",
    title: "JSON-LD structured data is valid",
    description:
      "Extracts JSON-LD blocks, validates JSON and checks @type declarations.",
    scope: "page",
    automation: "full",
    checkFn: structuredDataCheck,
  },
  {
    key: "structured-data-visible-match",
    section: "Structured data",
    title: "Structured data matches visible content",
    description:
      "Cross-checks marked-up price/availability/dates against visible page text.",
    scope: "page",
    automation: "semi",
    checkFn: structuredDataVisibleMatchCheck,
  },
  {
    key: "hreflang",
    section: "International SEO",
    title: "hreflang set is reciprocal and valid",
    description:
      "Parses hreflang tags and verifies reciprocity, self-reference and valid codes.",
    scope: "page",
    automation: "full",
    checkFn: hreflangCheck,
  },
  {
    key: "social-metadata",
    section: "Social/OG metadata",
    title: "Social/OG metadata is complete",
    description:
      "Checks for og:title, og:description, og:image, og:url and twitter:card.",
    scope: "page",
    automation: "full",
    checkFn: socialMetaCheck,
  },
  {
    key: "ai-crawler-access",
    section: "AI crawler access (AIO/AEO)",
    title: "AI crawlers are not blocked",
    description:
      "Reports allow/block status for GPTBot, ClaudeBot, PerplexityBot, Google-Extended and others.",
    scope: "site",
    automation: "full",
    checkFn: aiCrawlerAccessCheck,
  },
  {
    key: "aeo-structure",
    section: "Answer-focused content / AEO structure",
    title: "Answer-focused heading structure",
    description:
      "Heuristically detects question-style H2/H3 headings; requires manual review.",
    scope: "page",
    automation: "semi",
    checkFn: aeoStructureCheck,
  },
  {
    key: "eeat-signals",
    section: "E-E-A-T signals",
    title: "E-E-A-T signals present",
    description:
      "Detects About page links, author bylines, published dates and Organization schema; content quality stays manual.",
    scope: "page",
    automation: "semi",
    checkFn: eeatSignalsCheck,
  },
  {
    key: "content-quality",
    section: "Content quality (manual review)",
    title: "Content quality and originality",
    description:
      "Manual review of originality, depth, accuracy and helpfulness of content.",
    scope: "site",
    automation: "manual",
  },
  {
    key: "entity-brand-facts",
    section: "Content quality (manual review)",
    title: "Entity and brand facts are clear",
    description:
      "Manual review that the site clearly states who it is, what it offers and who it serves.",
    scope: "site",
    automation: "manual",
  },
  {
    key: "original-research",
    section: "Content quality (manual review)",
    title: "Original research and unique insight",
    description:
      "Manual review for first-party data, examples and original insight.",
    scope: "site",
    automation: "manual",
  },
];

export function getChecklistItem(key: string): ChecklistItem | undefined {
  return CHECKLIST.find((item) => item.key === key);
}

export function getAutomatableItems(): ChecklistItem[] {
  return CHECKLIST.filter((item) => item.automation !== "manual");
}

export function getManualItems(): ChecklistItem[] {
  return CHECKLIST.filter((item) => item.automation === "manual");
}

export function getChecklistKeys(): string[] {
  return CHECKLIST.map((item) => item.key);
}
