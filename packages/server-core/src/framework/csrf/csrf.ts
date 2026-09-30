import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import type { CookieOptions } from "express";

import type { IRequest, IResponse } from "../types";

export interface CsrfConfig {
  /** Secret used to sign the CSRF token. */
  secret: string;
  /** Path prefixes (relative to `basePath`) exempt from CSRF, e.g. webhooks. */
  ignoredPaths?: readonly string[];
  /** Base path stripped from `req.path` before matching `ignoredPaths`. */
  basePath?: string;
}

const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_COOKIE_NAME = "psifi.x-csrf-token";
const CSRF_SECURE_COOKIE_NAME = "__Host-psifi.x-csrf-token";
const CSRF_TOKEN_DELIMITER = ".";
const HMAC_ALGORITHM = "sha256";
const RANDOM_BYTES = 32;
const IGNORED_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function getCookieName(): string {
  return isProduction() ? CSRF_SECURE_COOKIE_NAME : CSRF_COOKIE_NAME;
}

function getCookieOptions(): CookieOptions {
  return {
    sameSite: "lax",
    path: "/",
    secure: isProduction(),
    httpOnly: true,
  };
}

function sign(randomValue: string, secret: string): string {
  return createHmac(HMAC_ALGORITHM, secret).update(randomValue).digest("hex");
}

function safeCompare(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, "utf8");
  const bufferB = Buffer.from(b, "utf8");

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return timingSafeEqual(bufferA, bufferB);
}

function getCookieToken(req: IRequest): string {
  return req.cookies?.[getCookieName()] ?? "";
}

function getHeaderToken(req: IRequest): string {
  const header = req.headers[CSRF_HEADER_NAME];

  return Array.isArray(header) ? (header[0] ?? "") : (header ?? "");
}

function verifyToken(token: string, secret: string): boolean {
  const [hmac, randomValue] = token.split(CSRF_TOKEN_DELIMITER);

  if (!hmac || !randomValue) {
    return false;
  }

  return safeCompare(hmac, sign(randomValue, secret));
}

function normalizeBasePath(basePath: string | undefined): string {
  if (!basePath || basePath === "/") {
    return "";
  }

  return basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
}

function isIgnoredPath(
  requestPath: string,
  basePath: string,
  ignoredPaths: readonly string[]
): boolean {
  const relativePath =
    basePath && requestPath.startsWith(basePath)
      ? requestPath.slice(basePath.length) || "/"
      : requestPath;

  return ignoredPaths.some((prefix) => {
    const normalizedPrefix = prefix.endsWith("/")
      ? prefix.slice(0, -1)
      : prefix;

    return (
      relativePath === normalizedPrefix ||
      relativePath.startsWith(`${normalizedPrefix}/`)
    );
  });
}

/**
 * Generates a CSRF token for the given request, reusing an already valid
 * cookie token when present.
 */
export function generateCsrfToken(req: IRequest, config: CsrfConfig): string {
  const cookieToken = getCookieToken(req);

  if (cookieToken !== "" && verifyToken(cookieToken, config.secret)) {
    return cookieToken;
  }

  const randomValue = randomBytes(RANDOM_BYTES).toString("hex");
  const hmac = sign(randomValue, config.secret);

  return `${hmac}${CSRF_TOKEN_DELIMITER}${randomValue}`;
}

/**
 * Validates the CSRF token by requiring the cookie and the `x-csrf-token`
 * header to match and carry a valid HMAC signature.
 */
export function validateCsrfToken(req: IRequest, config: CsrfConfig): boolean {
  const cookieToken = getCookieToken(req);
  const headerToken = getHeaderToken(req);

  if (
    !cookieToken ||
    !headerToken ||
    !safeCompare(cookieToken, headerToken)
  ) {
    return false;
  }

  return verifyToken(cookieToken, config.secret);
}

/** Whether the request must pass CSRF verification. */
export function shouldProtectRequest(
  req: IRequest,
  config: CsrfConfig
): boolean {
  if (IGNORED_METHODS.has(req.method ?? "")) {
    return false;
  }

  const basePath = normalizeBasePath(config.basePath);

  return !isIgnoredPath(req.path ?? "", basePath, config.ignoredPaths ?? []);
}

/** Sets the CSRF token on the response cookie. */
export function setCsrfCookie(res: IResponse, token: string): void {
  res.cookie(getCookieName(), token, getCookieOptions());
}
