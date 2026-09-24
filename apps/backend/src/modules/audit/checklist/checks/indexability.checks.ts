import {
  getCanonical,
  getHeadings,
  getTextContent,
  getTitle,
  getWordCount,
  hasNoindexDirective,
  hasNoindexHeader,
} from "../../lib/html";
import type { CheckContext, CheckResult } from "../types";

const THIN_CONTENT_WORDS = 300;
const SOFT_404_PATTERNS = [
  "page not found",
  "404 not found",
  "the page you are looking for",
  "sorry, this page",
  "no longer available",
  "we couldn't find",
  "we could not find",
  "nothing found",
];

export async function metaRobotsCheck(
  context: CheckContext
): Promise<CheckResult> {
  const response = await context.fetchPage(context.url);
  if (!response.ok) {
    return {
      status: "skipped",
      message: `Page returned HTTP ${response.status}`,
    };
  }

  const noindex = hasNoindexDirective(response.body);
  const robots = response.body.match(
    /<meta[^>]*name=["']robots["'][^>]*>/i
  )?.[0];

  if (noindex) {
    return {
      status: "failed",
      message: "Page has a meta robots noindex directive",
      evidence: { url: context.url, tag: robots ?? null },
    };
  }

  return {
    status: "passed",
    message: "Page is not blocked by meta robots",
    evidence: { url: context.url, tag: robots ?? null },
  };
}

export async function xRobotsHeaderCheck(
  context: CheckContext
): Promise<CheckResult> {
  const response = await context.fetchPage(context.url);
  const header = response.headers["x-robots-tag"];

  if (hasNoindexHeader(header)) {
    return {
      status: "failed",
      message: "X-Robots-Tag header contains noindex",
      evidence: { url: context.url, header },
    };
  }

  return {
    status: "passed",
    message: "X-Robots-Tag header does not block indexing",
    evidence: { url: context.url, header: header ?? null },
  };
}

export async function titleCheck(context: CheckContext): Promise<CheckResult> {
  const response = await context.fetchPage(context.url);
  if (!response.ok) {
    return {
      status: "skipped",
      message: `Page returned HTTP ${response.status}`,
    };
  }

  const title = getTitle(response.body);

  if (!title) {
    return {
      status: "failed",
      message: "Page is missing a <title> tag",
      evidence: { url: context.url },
    };
  }

  if (title.length < 15 || title.length > 70) {
    return {
      status: "warning",
      message: `Title length is ${title.length} characters (recommended 15-70)`,
      evidence: { url: context.url, title },
    };
  }

  return {
    status: "passed",
    message: "Title tag is present with a reasonable length",
    evidence: { url: context.url, title },
  };
}

export async function h1Check(context: CheckContext): Promise<CheckResult> {
  const response = await context.fetchPage(context.url);
  if (!response.ok) {
    return {
      status: "skipped",
      message: `Page returned HTTP ${response.status}`,
    };
  }

  const h1s = getHeadings(response.body, 1);

  if (h1s.length === 0) {
    return {
      status: "failed",
      message: "Page has no H1 heading",
      evidence: { url: context.url },
    };
  }

  if (h1s.length > 1) {
    return {
      status: "warning",
      message: `Page has ${h1s.length} H1 headings`,
      evidence: { url: context.url, h1s },
    };
  }

  return {
    status: "passed",
    message: "Page has exactly one H1 heading",
    evidence: { url: context.url, h1: h1s[0] ?? null },
  };
}

export async function thinContentCheck(
  context: CheckContext
): Promise<CheckResult> {
  const response = await context.fetchPage(context.url);
  if (!response.ok) {
    return {
      status: "skipped",
      message: `Page returned HTTP ${response.status}`,
    };
  }

  const words = getWordCount(response.body);

  if (words < THIN_CONTENT_WORDS) {
    return {
      status: "warning",
      message: `Page has only ${words} words of content`,
      evidence: { url: context.url, words, threshold: THIN_CONTENT_WORDS },
    };
  }

  return {
    status: "passed",
    message: `Page has ${words} words of content`,
    evidence: { url: context.url, words },
  };
}

export async function canonicalTagCheck(
  context: CheckContext
): Promise<CheckResult> {
  const response = await context.fetchPage(context.url);
  if (!response.ok) {
    return {
      status: "skipped",
      message: `Page returned HTTP ${response.status}`,
    };
  }

  const canonical = getCanonical(response.body);
  const noindex = hasNoindexDirective(response.body);

  if (!canonical) {
    return {
      status: "warning",
      message: "Page has no canonical tag",
      evidence: { url: context.url },
    };
  }

  const isAbsolute = /^https?:\/\//i.test(canonical);
  const normalized = canonical.replace(/\/+$/, "");
  const selfReferencing =
    normalized === context.url.replace(/\/+$/, "") ||
    normalized === response.finalUrl.replace(/\/+$/, "");

  if (noindex && selfReferencing) {
    return {
      status: "failed",
      message: "Canonical points to a page that is also noindex",
      evidence: { url: context.url, canonical, noindex },
    };
  }

  if (!isAbsolute) {
    return {
      status: "warning",
      message: "Canonical tag is not an absolute URL",
      evidence: { url: context.url, canonical },
    };
  }

  if (!selfReferencing) {
    return {
      status: "warning",
      message: "Canonical is not self-referencing",
      evidence: { url: context.url, canonical, finalUrl: response.finalUrl },
    };
  }

  return {
    status: "passed",
    message: "Canonical tag is absolute and self-referencing",
    evidence: { url: context.url, canonical },
  };
}

export async function soft404Check(
  context: CheckContext
): Promise<CheckResult> {
  const response = await context.fetchPage(context.url);
  if (!response.ok) {
    return {
      status: "skipped",
      message: `Page returned HTTP ${response.status}`,
    };
  }

  const text = getTextContent(response.body).toLowerCase().slice(0, 4000);
  const matches = SOFT_404_PATTERNS.filter((pattern) => text.includes(pattern));

  if (matches.length > 0) {
    return {
      status: "warning",
      message: "Page returns 200 but content looks like a not-found page",
      evidence: { url: context.url, matches },
    };
  }

  return {
    status: "passed",
    message: "Page does not look like a soft 404",
    evidence: { url: context.url },
  };
}
