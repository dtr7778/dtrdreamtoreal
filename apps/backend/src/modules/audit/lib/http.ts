import type { AxiosResponse } from "axios";

import { httpClient } from "@/lib/http-client";

export interface HttpFetchOptions {
  method?: "GET" | "HEAD" | "POST";
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
  maxRedirects?: number;
  signal?: AbortSignal;
}

export interface HttpRedirectHop {
  url: string;
  status: number;
  location: string | null;
}

export interface HttpFetchResult {
  requestedUrl: string;
  finalUrl: string;
  status: number;
  ok: boolean;
  headers: Record<string, string>;
  body: string;
  contentType: string | null;
  redirectChain: HttpRedirectHop[];
  redirectCount: number;
  loopDetected: boolean;
  durationMs: number;
  error: string | null;
}

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_REDIRECTS = 10;
const USER_AGENT =
  "Mozilla/5.0 (compatible; DTRBot/1.0; +https://dream-to-real.com/bot)";

function headersToObject(
  headers: AxiosResponse["headers"]
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) continue;
    result[key.toLowerCase()] = Array.isArray(value)
      ? value.join(", ")
      : String(value);
  }
  return result;
}

function resolveLocation(base: string, location: string): string {
  try {
    return new URL(location, base).toString();
  } catch {
    return location;
  }
}

function readBody(response: AxiosResponse<string>, method: string): string {
  if (method === "HEAD") return "";
  return typeof response.data === "string" ? response.data : "";
}

/**
 * Fetch a URL while following redirects manually so the full redirect chain
 * (and any loops) can be recorded for the redirect/status-code checks.
 */
export async function httpFetch(
  url: string,
  options: HttpFetchOptions = {}
): Promise<HttpFetchResult> {
  const {
    method = "GET",
    headers = {},
    body,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxRedirects = DEFAULT_MAX_REDIRECTS,
  } = options;

  const startedAt = Date.now();
  const redirectChain: HttpRedirectHop[] = [];
  const visited = new Set<string>();

  let currentUrl = url;
  let loopDetected = false;
  let lastStatus = 0;
  let lastHeaders: Record<string, string> = {};
  let lastContentType: string | null = null;
  let lastBody = "";
  let error: string | null = null;

  for (let hop = 0; hop <= maxRedirects; hop += 1) {
    if (visited.has(currentUrl)) {
      loopDetected = true;
      break;
    }
    visited.add(currentUrl);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const abortSignal = options.signal
      ? AbortSignal.any([controller.signal, options.signal])
      : controller.signal;

    try {
      const response = await httpClient.request<string>({
        url: currentUrl,
        method,
        headers: { "user-agent": USER_AGENT, ...headers },
        data: body,
        signal: abortSignal,
        maxRedirects: 0,
      });

      clearTimeout(timer);

      const responseHeaders = headersToObject(response.headers);
      lastStatus = response.status;
      lastHeaders = responseHeaders;
      lastContentType = responseHeaders["content-type"] ?? null;

      if (response.status >= 300 && response.status < 400) {
        const location = responseHeaders["location"] ?? null;
        redirectChain.push({
          url: currentUrl,
          status: response.status,
          location,
        });

        if (!location) {
          lastBody = readBody(response, method);
          break;
        }

        currentUrl = resolveLocation(currentUrl, location);
        continue;
      }

      lastBody = readBody(response, method);
      break;
    } catch (err) {
      clearTimeout(timer);
      error = err instanceof Error ? err.message : "Unknown fetch error";
      break;
    }
  }

  return {
    requestedUrl: url,
    finalUrl: currentUrl,
    status: lastStatus,
    ok: lastStatus >= 200 && lastStatus < 300,
    headers: lastHeaders,
    body: lastBody,
    contentType: lastContentType,
    redirectChain,
    redirectCount: redirectChain.length,
    loopDetected,
    durationMs: Date.now() - startedAt,
    error,
  };
}
