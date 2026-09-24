import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import type { CookieOptions } from "express";

import type { IRequest, IResponse } from "../types";

export type CsrfCookieOptions = CookieOptions;

export interface CsrfConfig {
  /** Secret used to sign the CSRF token. */
  secret: string;
  /** Name of the cookie holding the CSRF token. */
  cookieName?: string;
  /** Options applied to the CSRF cookie. */
  cookieOptions?: CsrfCookieOptions;
  /** Amount of random bytes embedded in the token. */
  size?: number;
  /** HMAC algorithm used to sign the token. */
  hmacAlgorithm?: string;
  /** Delimiter used between the HMAC and the random value. */
  csrfTokenDelimiter?: string;
  /** Delimiter used when building the signed message. */
  messageDelimiter?: string;
  /** HTTP methods that are exempt from CSRF protection. */
  ignoredMethods?: readonly string[];
  /**
   * Path prefixes (relative to `basePath`) that are exempt from CSRF
   * protection, e.g. `["/mails/resend"]` for provider webhooks.
   */
  ignoredPaths?: readonly string[];
  /** Base path stripped from `req.path` before matching `ignoredPaths`. */
  basePath?: string;
  /** Custom escape hatch to bypass CSRF verification for a request. */
  skipCsrfProtection?: (req: IRequest) => boolean;
  /** Resolves the session identifier bound into the signed message. */
  getSessionIdentifier?: (req: IRequest) => string;
  /** Extracts the CSRF token provided by the request. */
  getCsrfTokenFromRequest?: (req: IRequest) => string | undefined;
  /** Always generate a fresh token instead of reusing a valid cookie. */
  overwrite?: boolean;
}

export type ResolvedCsrfConfig = Readonly<
  Required<Omit<CsrfConfig, "ignoredMethods">> & {
    resolved: true;
    ignoredMethods: ReadonlySet<string>;
  }
>;

const DEFAULT_IGNORED_METHODS = ["GET", "HEAD", "OPTIONS"] as const;
const DEFAULT_CSRF_TOKEN_DELIMITER = ".";
const DEFAULT_MESSAGE_DELIMITER = "!";
const DEFAULT_HMAC_ALGORITHM = "sha256";
const DEFAULT_SIZE = 32;

const defaultGetSessionIdentifier = (req: IRequest): string => req.ip ?? "";

const defaultGetCsrfTokenFromRequest = (req: IRequest): string | undefined => {
  const header = req.headers["x-csrf-token"];
  return Array.isArray(header) ? header[0] : header;
};

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

export function resolveCsrfConfig(
  config: CsrfConfig | ResolvedCsrfConfig
): ResolvedCsrfConfig {
  if ("resolved" in config) {
    return config;
  }

  const isProduction = process.env.NODE_ENV === "production";
  const ignoredPaths = config.ignoredPaths ?? [];
  const basePath = normalizeBasePath(config.basePath);
  const userSkipCsrfProtection = config.skipCsrfProtection;

  return {
    resolved: true,
    secret: config.secret,
    cookieName:
      config.cookieName ??
      (isProduction ? "__Host-psifi.x-csrf-token" : "psifi.x-csrf-token"),
    cookieOptions: {
      sameSite: "lax",
      path: "/",
      secure: isProduction,
      httpOnly: true,
      ...config.cookieOptions,
    },
    size: config.size ?? DEFAULT_SIZE,
    hmacAlgorithm: config.hmacAlgorithm ?? DEFAULT_HMAC_ALGORITHM,
    csrfTokenDelimiter:
      config.csrfTokenDelimiter ?? DEFAULT_CSRF_TOKEN_DELIMITER,
    messageDelimiter: config.messageDelimiter ?? DEFAULT_MESSAGE_DELIMITER,
    ignoredMethods: new Set(config.ignoredMethods ?? DEFAULT_IGNORED_METHODS),
    ignoredPaths,
    basePath,
    skipCsrfProtection: (req) => {
      if (userSkipCsrfProtection?.(req)) {
        return true;
      }

      return isIgnoredPath(req.path ?? "", basePath, ignoredPaths);
    },
    getSessionIdentifier:
      config.getSessionIdentifier ?? defaultGetSessionIdentifier,
    getCsrfTokenFromRequest:
      config.getCsrfTokenFromRequest ?? defaultGetCsrfTokenFromRequest,
    overwrite: config.overwrite ?? false,
  };
}

function constructMessage(
  req: IRequest,
  randomValue: string,
  config: ResolvedCsrfConfig
): string {
  const sessionIdentifier = config.getSessionIdentifier(req);
  return [
    sessionIdentifier.length,
    sessionIdentifier,
    randomValue.length,
    randomValue,
  ].join(config.messageDelimiter);
}

function sign(
  req: IRequest,
  randomValue: string,
  config: ResolvedCsrfConfig
): string {
  const message = constructMessage(req, randomValue, config);
  return createHmac(config.hmacAlgorithm, config.secret)
    .update(message)
    .digest("hex");
}

function safeCompare(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, "utf8");
  const bufferB = Buffer.from(b, "utf8");

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return timingSafeEqual(bufferA, bufferB);
}

function getCsrfTokenFromCookie(
  req: IRequest,
  config: ResolvedCsrfConfig
): string {
  return req.cookies?.[config.cookieName] ?? "";
}

function verifyToken(
  req: IRequest,
  token: string,
  config: ResolvedCsrfConfig
): boolean {
  const [expectedHmac, randomValue] = token.split(config.csrfTokenDelimiter);

  if (!expectedHmac || !randomValue) {
    return false;
  }

  return safeCompare(expectedHmac, sign(req, randomValue, config));
}

/**
 * Generates a CSRF token for the given request without touching the response.
 * Reuses an already valid cookie token unless `overwrite` is set.
 */
export function generateCsrfToken(
  req: IRequest,
  config: CsrfConfig | ResolvedCsrfConfig
): string {
  const resolved = resolveCsrfConfig(config);
  const existingToken = getCsrfTokenFromCookie(req, resolved);

  if (
    !resolved.overwrite &&
    existingToken !== "" &&
    verifyToken(req, existingToken, resolved)
  ) {
    return existingToken;
  }

  const randomValue = randomBytes(resolved.size).toString("hex");
  const hmac = sign(req, randomValue, resolved);

  return `${hmac}${resolved.csrfTokenDelimiter}${randomValue}`;
}

/**
 * Validates the CSRF token by comparing the cookie and the request token and
 * verifying the HMAC signature.
 */
export function validateCsrfToken(
  req: IRequest,
  config: CsrfConfig | ResolvedCsrfConfig
): boolean {
  const resolved = resolveCsrfConfig(config);
  const cookieToken = getCsrfTokenFromCookie(req, resolved);
  const requestToken = resolved.getCsrfTokenFromRequest(req);

  if (
    !cookieToken ||
    !requestToken ||
    !safeCompare(cookieToken, requestToken)
  ) {
    return false;
  }

  return verifyToken(req, cookieToken, resolved);
}

/** Whether the request must pass CSRF verification. */
export function shouldProtectRequest(
  req: IRequest,
  config: CsrfConfig | ResolvedCsrfConfig
): boolean {
  const resolved = resolveCsrfConfig(config);

  if (resolved.ignoredMethods.has(req.method ?? "")) {
    return false;
  }

  return !resolved.skipCsrfProtection(req);
}

/** Sets the CSRF token on the response cookie. */
export function setCsrfCookie(
  res: IResponse,
  token: string,
  config: CsrfConfig | ResolvedCsrfConfig
): void {
  const resolved = resolveCsrfConfig(config);
  res.cookie(resolved.cookieName, token, resolved.cookieOptions);
}
