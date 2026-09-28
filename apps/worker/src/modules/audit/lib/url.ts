export interface UrlIssue {
  code: string;
  message: string;
  severity: "error" | "warning";
}

const SESSION_ID_PATTERNS = [
  /[?&](phpsessid|jsessionid|sessionid|sid)=/i,
  /;jsessionid=/i,
];

const COMMON_TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
  "ref",
];

export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
      parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function isSameOrigin(a: string, b: string): boolean {
  try {
    return new URL(a).origin === new URL(b).origin;
  } catch {
    return false;
  }
}

export function isInternalLink(href: string, baseUrl: string): boolean {
  if (!href) return false;
  if (href.startsWith("#") || href.startsWith("mailto:")) return false;
  if (href.startsWith("tel:") || href.startsWith("javascript:")) return false;
  try {
    return new URL(href, baseUrl).origin === new URL(baseUrl).origin;
  } catch {
    return false;
  }
}

export function lintUrl(rawUrl: string): UrlIssue[] {
  const issues: UrlIssue[] = [];

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return [
      {
        code: "invalid-url",
        message: "URL could not be parsed",
        severity: "error",
      },
    ];
  }

  const fullPath = `${parsed.pathname}${parsed.search}`;

  if (/[A-Z]/.test(parsed.pathname)) {
    issues.push({
      code: "uppercase-path",
      message: "URL path contains uppercase characters",
      severity: "warning",
    });
  }

  for (const pattern of SESSION_ID_PATTERNS) {
    if (pattern.test(fullPath)) {
      issues.push({
        code: "session-id",
        message: "URL contains a session identifier",
        severity: "error",
      });
      break;
    }
  }

  const paramKeys = [...parsed.searchParams.keys()];
  const trackingParams = paramKeys.filter((key) =>
    COMMON_TRACKING_PARAMS.includes(key.toLowerCase())
  );
  if (trackingParams.length > 0) {
    issues.push({
      code: "tracking-params",
      message: `URL contains tracking parameters: ${trackingParams.join(", ")}`,
      severity: "warning",
    });
  }

  if (paramKeys.length > 3) {
    issues.push({
      code: "too-many-params",
      message: `URL has ${paramKeys.length} query parameters`,
      severity: "warning",
    });
  }

  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length > 4) {
    issues.push({
      code: "too-deep",
      message: `URL is ${segments.length} levels deep`,
      severity: "warning",
    });
  }

  if (/[_]/.test(parsed.pathname)) {
    issues.push({
      code: "underscore-separator",
      message: "URL path uses underscores instead of hyphens",
      severity: "warning",
    });
  }

  if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
    issues.push({
      code: "trailing-slash",
      message: "URL has a trailing slash",
      severity: "warning",
    });
  }

  if (parsed.hostname.startsWith("www.")) {
    issues.push({
      code: "www-prefix",
      message: "URL uses a www hostname",
      severity: "warning",
    });
  }

  if (parsed.protocol !== "https:") {
    issues.push({
      code: "not-https",
      message: "URL is not served over HTTPS",
      severity: "error",
    });
  }

  return issues;
}

export interface HostVariants {
  httpsWww: string;
  httpsNonWww: string;
  httpWww: string;
  httpNonWww: string;
}

export function getHostVariants(rawUrl: string): HostVariants | null {
  try {
    const parsed = new URL(rawUrl);
    const bareHost = parsed.hostname.replace(/^www\./, "");
    const wwwHost = `www.${bareHost}`;
    const path = `${parsed.pathname}${parsed.search}`;
    return {
      httpsWww: `https://${wwwHost}${path}`,
      httpsNonWww: `https://${bareHost}${path}`,
      httpWww: `http://${wwwHost}${path}`,
      httpNonWww: `http://${bareHost}${path}`,
    };
  } catch {
    return null;
  }
}

export function resolveUrl(href: string, baseUrl: string): string | null {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

export function getUrlDepth(rawUrl: string): number {
  try {
    const parsed = new URL(rawUrl);
    return parsed.pathname.split("/").filter(Boolean).length;
  } catch {
    return 0;
  }
}

export function getOrigin(rawUrl: string): string | null {
  try {
    return new URL(rawUrl).origin;
  } catch {
    return null;
  }
}
