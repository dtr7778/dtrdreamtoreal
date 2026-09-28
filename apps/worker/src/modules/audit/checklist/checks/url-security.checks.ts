import { findHttpResources, getAnchors } from "../../lib/html";
import { inspectCertificate } from "../../lib/ssl";
import { lintUrl } from "../../lib/url";
import type { CheckContext, CheckResult } from "../types";

const GENERIC_ANCHOR_TEXTS = [
  "click here",
  "here",
  "read more",
  "more",
  "learn more",
  "link",
  "this",
  "this page",
  "website",
];

export async function urlStructureCheck(
  context: CheckContext
): Promise<CheckResult> {
  const issues = lintUrl(context.url);

  if (issues.some((issue) => issue.severity === "error")) {
    return {
      status: "failed",
      message: `URL has ${issues.length} structural issue(s)`,
      evidence: { url: context.url, issues },
    };
  }

  if (issues.length > 0) {
    return {
      status: "warning",
      message: `URL has ${issues.length} structural warning(s)`,
      evidence: { url: context.url, issues },
    };
  }

  return {
    status: "passed",
    message: "URL structure follows best practices",
    evidence: { url: context.url },
  };
}

export async function httpToHttpsRedirectCheck(
  context: CheckContext
): Promise<CheckResult> {
  const url = new URL(context.url);
  if (url.protocol !== "https:") {
    return {
      status: "failed",
      message: "Page is not served over HTTPS",
      evidence: { url: context.url },
    };
  }

  const httpUrl = `http://${url.host}${url.pathname}${url.search}`;
  const response = await context.fetchPage(httpUrl);

  if (response.error) {
    return {
      status: "failed",
      message: `HTTP variant could not be reached: ${response.error}`,
      evidence: { httpUrl },
    };
  }

  const redirectedToHttps = response.finalUrl.startsWith("https://");
  // `status` is the final response, so inspect the first hop for the actual
  // redirect status of the HTTP -> HTTPS redirect.
  const redirectStatus = response.redirectChain[0]?.status ?? response.status;
  const permanentRedirect = [301, 308].includes(redirectStatus);

  if (!redirectedToHttps) {
    return {
      status: "failed",
      message: "HTTP variant does not redirect to HTTPS",
      evidence: {
        httpUrl,
        finalUrl: response.finalUrl,
        status: redirectStatus,
      },
    };
  }

  if (!permanentRedirect) {
    return {
      status: "warning",
      message: `HTTP redirects to HTTPS with status ${redirectStatus} (prefer 301)`,
      evidence: {
        httpUrl,
        finalUrl: response.finalUrl,
        status: redirectStatus,
      },
    };
  }

  return {
    status: "passed",
    message: "HTTP permanently redirects to HTTPS",
    evidence: {
      httpUrl,
      finalUrl: response.finalUrl,
      status: redirectStatus,
    },
  };
}

export async function mixedContentCheck(
  context: CheckContext
): Promise<CheckResult> {
  if (!context.url.startsWith("https://")) {
    return { status: "skipped", message: "Page is not served over HTTPS" };
  }

  const response = await context.fetchPage(context.url);
  if (!response.ok) {
    return {
      status: "skipped",
      message: `Page returned HTTP ${response.status}`,
    };
  }

  const insecure = findHttpResources(response.body);

  if (insecure.length > 0) {
    return {
      status: "failed",
      message: `Page references ${insecure.length} insecure http:// resource(s)`,
      evidence: { url: context.url, resources: insecure.slice(0, 30) },
    };
  }

  return {
    status: "passed",
    message: "No mixed-content resources found",
    evidence: { url: context.url },
  };
}

export async function sslCertificateCheck(
  context: CheckContext
): Promise<CheckResult> {
  const url = new URL(context.url);
  if (url.protocol !== "https:") {
    return {
      status: "skipped",
      message: "Page is not served over HTTPS",
    };
  }

  const info = await inspectCertificate(
    url.hostname,
    url.port ? Number(url.port) : 443
  );

  if (info.error) {
    return {
      status: "failed",
      message: `TLS certificate check failed: ${info.error}`,
      evidence: { hostname: url.hostname, ...info },
    };
  }

  if (info.daysUntilExpiry !== null && info.daysUntilExpiry < 14) {
    return {
      status: "warning",
      message: `TLS certificate expires in ${info.daysUntilExpiry} day(s)`,
      evidence: { hostname: url.hostname, ...info },
    };
  }

  return {
    status: "passed",
    message: `TLS certificate is valid for ${info.daysUntilExpiry} more day(s)`,
    evidence: { hostname: url.hostname, ...info },
  };
}

export async function hstsHeaderCheck(
  context: CheckContext
): Promise<CheckResult> {
  const response = await context.fetchPage(context.url);
  const hsts = response.headers["strict-transport-security"];

  if (!hsts) {
    return {
      status: "warning",
      message: "Strict-Transport-Security header is missing",
      evidence: { url: context.url },
    };
  }

  const hasMaxAge = /max-age=\d+/i.test(hsts);

  if (!hasMaxAge) {
    return {
      status: "warning",
      message: "HSTS header is missing a max-age directive",
      evidence: { url: context.url, hsts },
    };
  }

  return {
    status: "passed",
    message: "HSTS header is present with max-age",
    evidence: { url: context.url, hsts },
  };
}

export async function genericAnchorTextCheck(
  context: CheckContext
): Promise<CheckResult> {
  const response = await context.fetchPage(context.url);
  if (!response.ok) {
    return {
      status: "skipped",
      message: `Page returned HTTP ${response.status}`,
    };
  }

  const origin = new URL(context.siteUrl).origin;
  const generic: Array<{ text: string; href: string }> = [];

  for (const anchor of getAnchors(response.body)) {
    if (!anchor.href) continue;
    const isInternal = (() => {
      try {
        return new URL(anchor.href, context.url).origin === origin;
      } catch {
        return false;
      }
    })();
    if (!isInternal) continue;
    if (GENERIC_ANCHOR_TEXTS.includes(anchor.text.toLowerCase())) {
      generic.push({ text: anchor.text, href: anchor.href });
    }
  }

  if (generic.length > 0) {
    return {
      status: "warning",
      message: `${generic.length} internal link(s) use generic anchor text`,
      evidence: { url: context.url, generic: generic.slice(0, 20) },
    };
  }

  return {
    status: "passed",
    message: "No generic internal anchor text detected",
    evidence: { url: context.url },
  };
}
