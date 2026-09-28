import {
  getImages,
  getScriptSrcs,
  getViewport,
  getWordCount,
} from "../../lib/html";
import type { CheckContext, CheckResult } from "../types";

export async function imageAltCheck(
  context: CheckContext
): Promise<CheckResult> {
  const response = await context.fetchPage(context.url);
  if (!response.ok) {
    return {
      status: "skipped",
      message: `Page returned HTTP ${response.status}`,
    };
  }

  const images = getImages(response.body);
  const missingAlt = images.filter(
    (image) => image.alt === null || image.alt.trim() === ""
  );
  const decorative = images.filter((image) => image.alt === "");

  if (missingAlt.length > decorative.length && missingAlt.length > 0) {
    return {
      status: "failed",
      message: `${missingAlt.length} image(s) are missing alt text`,
      evidence: {
        url: context.url,
        total: images.length,
        missing: missingAlt.length,
      },
    };
  }

  return {
    status: "passed",
    message: `All ${images.length} image(s) have alt attributes`,
    evidence: { url: context.url, total: images.length },
  };
}

export async function imageDimensionsCheck(
  context: CheckContext
): Promise<CheckResult> {
  const response = await context.fetchPage(context.url);
  if (!response.ok) {
    return {
      status: "skipped",
      message: `Page returned HTTP ${response.status}`,
    };
  }

  const images = getImages(response.body);
  const missing = images.filter((image) => !image.width || !image.height);

  if (missing.length > 0) {
    return {
      status: "warning",
      message: `${missing.length} image(s) are missing width/height attributes`,
      evidence: {
        url: context.url,
        missing: missing.slice(0, 20).map((image) => image.src),
      },
    };
  }

  return {
    status: "passed",
    message: "All images declare width and height",
    evidence: { url: context.url, total: images.length },
  };
}

export async function imageLazyLoadingCheck(
  context: CheckContext
): Promise<CheckResult> {
  const response = await context.fetchPage(context.url);
  if (!response.ok) {
    return {
      status: "skipped",
      message: `Page returned HTTP ${response.status}`,
    };
  }

  const images = getImages(response.body);
  if (images.length === 0) {
    return { status: "passed", message: "Page has no images" };
  }

  const firstImage = images[0];
  const lcpImageLazy = firstImage?.isLazy ?? false;
  const eagerBelowFold = images.filter((image) => !image.isLazy).length;

  if (lcpImageLazy) {
    return {
      status: "warning",
      message: "The first (likely LCP) image is lazy-loaded",
      evidence: { url: context.url, total: images.length, eagerBelowFold },
    };
  }

  if (images.length > 1 && eagerBelowFold > 1) {
    return {
      status: "warning",
      message: `${eagerBelowFold} image(s) are not lazy-loaded`,
      evidence: { url: context.url, total: images.length, eagerBelowFold },
    };
  }

  return {
    status: "passed",
    message: "Image loading strategy looks reasonable",
    evidence: { url: context.url, total: images.length },
  };
}

export async function imageSrcsetCheck(
  context: CheckContext
): Promise<CheckResult> {
  const response = await context.fetchPage(context.url);
  if (!response.ok) {
    return {
      status: "skipped",
      message: `Page returned HTTP ${response.status}`,
    };
  }

  const images = getImages(response.body);
  const withoutSrcset = images.filter((image) => !image.srcset);

  if (images.length > 0 && withoutSrcset.length === images.length) {
    return {
      status: "warning",
      message: "No images use responsive srcset",
      evidence: { url: context.url, total: images.length },
    };
  }

  return {
    status: "passed",
    message: "Responsive images are in use",
    evidence: {
      url: context.url,
      total: images.length,
      withSrcset: images.length - withoutSrcset.length,
    },
  };
}

export async function viewportMetaCheck(
  context: CheckContext
): Promise<CheckResult> {
  const response = await context.fetchPage(context.url);
  if (!response.ok) {
    return {
      status: "skipped",
      message: `Page returned HTTP ${response.status}`,
    };
  }

  const viewport = getViewport(response.body);

  if (!viewport) {
    return {
      status: "failed",
      message: "Page is missing a viewport meta tag",
      evidence: { url: context.url },
    };
  }

  if (!viewport.toLowerCase().includes("width=device-width")) {
    return {
      status: "warning",
      message: "Viewport meta tag does not set width=device-width",
      evidence: { url: context.url, viewport },
    };
  }

  return {
    status: "passed",
    message: "Viewport meta tag is correctly configured",
    evidence: { url: context.url, viewport },
  };
}

const SPA_MOUNT_PATTERNS = [
  'id="root"',
  "id='root'",
  'id="app"',
  "id='app'",
  "__next_data__",
  'id="__nuxt"',
  "data-reactroot",
];

export async function jsRenderingCheck(
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
  const words = getWordCount(html);
  const scripts = getScriptSrcs(html);
  const lower = html.toLowerCase();
  const spaMarkers = SPA_MOUNT_PATTERNS.filter((marker) =>
    lower.includes(marker)
  );

  const likelyJsRendered =
    words < 100 && (scripts.length >= 3 || spaMarkers.length > 0);

  if (likelyJsRendered) {
    return {
      status: "needs_review",
      message:
        "Page appears to render critical content with JavaScript; AI crawlers may not see it",
      evidence: {
        url: context.url,
        wordsInRawHtml: words,
        scriptCount: scripts.length,
        spaMarkers,
      },
    };
  }

  return {
    status: "passed",
    message: "Critical content is present in the raw HTML",
    evidence: {
      url: context.url,
      wordsInRawHtml: words,
      scriptCount: scripts.length,
    },
  };
}
