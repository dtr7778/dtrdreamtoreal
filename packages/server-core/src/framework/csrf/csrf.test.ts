import { afterEach, describe, expect, it, vi } from "vitest";

import type { IRequest, IResponse } from "../types";
import {
  generateCsrfToken,
  setCsrfCookie,
  shouldProtectRequest,
  validateCsrfToken,
} from "./csrf";

const SECRET = "test-secret";
const COOKIE_NAME = "psifi.x-csrf-token";
const HEADER_NAME = "x-csrf-token";

function createRequest(overrides: Record<string, unknown> = {}): IRequest {
  return {
    method: "POST",
    headers: {},
    cookies: {},
    ip: "127.0.0.1",
    ...overrides,
  } as unknown as IRequest;
}

function authorizeRequest(token: string): IRequest {
  return createRequest({
    cookies: { [COOKIE_NAME]: token },
    headers: { [HEADER_NAME]: token },
  });
}

describe("generateCsrfToken", () => {
  it("generates an hmac.random token", () => {
    const token = generateCsrfToken(createRequest(), { secret: SECRET });

    expect(token).toMatch(/^[a-f0-9]+\.[a-f0-9]+$/);
  });

  it("reuses an existing valid cookie token", () => {
    const token = generateCsrfToken(createRequest(), { secret: SECRET });
    const withCookie = createRequest({ cookies: { [COOKIE_NAME]: token } });

    expect(generateCsrfToken(withCookie, { secret: SECRET })).toBe(token);
  });

  it("generates a new token when the existing cookie is invalid", () => {
    const withCookie = createRequest({
      cookies: { [COOKIE_NAME]: "invalid.token" },
    });

    const token = generateCsrfToken(withCookie, { secret: SECRET });

    expect(token).not.toBe("invalid.token");
    expect(validateCsrfToken(authorizeRequest(token), { secret: SECRET })).toBe(
      true
    );
  });
});

describe("validateCsrfToken", () => {
  function validToken() {
    return generateCsrfToken(createRequest(), { secret: SECRET });
  }

  it("accepts a matching cookie and header", () => {
    expect(
      validateCsrfToken(authorizeRequest(validToken()), { secret: SECRET })
    ).toBe(true);
  });

  it("reads the token from an array header value", () => {
    const token = validToken();
    const request = createRequest({
      cookies: { [COOKIE_NAME]: token },
      headers: { [HEADER_NAME]: [token] },
    });

    expect(validateCsrfToken(request, { secret: SECRET })).toBe(true);
  });

  it("rejects when the header is missing", () => {
    const token = validToken();
    const request = createRequest({ cookies: { [COOKIE_NAME]: token } });

    expect(validateCsrfToken(request, { secret: SECRET })).toBe(false);
  });

  it("rejects when the cookie is missing", () => {
    const token = validToken();
    const request = createRequest({ headers: { [HEADER_NAME]: token } });

    expect(validateCsrfToken(request, { secret: SECRET })).toBe(false);
  });

  it("rejects when cookie and header differ", () => {
    const token = validToken();
    const request = createRequest({
      cookies: { [COOKIE_NAME]: token },
      headers: { [HEADER_NAME]: `${token}x` },
    });

    expect(validateCsrfToken(request, { secret: SECRET })).toBe(false);
  });

  it("rejects a tampered hmac", () => {
    const [, randomValue] = validToken().split(".");

    expect(
      validateCsrfToken(authorizeRequest(`deadbeef.${randomValue}`), {
        secret: SECRET,
      })
    ).toBe(false);
  });

  it("rejects a tampered random value", () => {
    const [hmac] = validToken().split(".");

    expect(
      validateCsrfToken(authorizeRequest(`${hmac}.deadbeef`), {
        secret: SECRET,
      })
    ).toBe(false);
  });

  it("rejects an empty cookie value", () => {
    expect(validateCsrfToken(authorizeRequest(""), { secret: SECRET })).toBe(
      false
    );
  });

  it("rejects a token signed with a different secret", () => {
    expect(
      validateCsrfToken(authorizeRequest(validToken()), {
        secret: "another-secret",
      })
    ).toBe(false);
  });
});

describe("shouldProtectRequest", () => {
  const config = { secret: SECRET };

  it.each(["GET", "HEAD", "OPTIONS"])("skips %s requests", (method) => {
    expect(shouldProtectRequest(createRequest({ method }), config)).toBe(false);
  });

  it.each(["POST", "PUT", "PATCH", "DELETE"])(
    "protects %s requests",
    (method) => {
      expect(shouldProtectRequest(createRequest({ method }), config)).toBe(true);
    }
  );

  const ignoredConfig = {
    secret: SECRET,
    basePath: "/api/v1",
    ignoredPaths: ["/mails/resend"],
  };

  it("skips webhook paths under the base path", () => {
    expect(
      shouldProtectRequest(
        createRequest({ path: "/api/v1/mails/resend/inbound" }),
        ignoredConfig
      )
    ).toBe(false);
  });

  it("protects the frontend mail endpoint", () => {
    expect(
      shouldProtectRequest(
        createRequest({ path: "/api/v1/mails/" }),
        ignoredConfig
      )
    ).toBe(true);
  });

  it("does not match paths that share the ignored prefix", () => {
    expect(
      shouldProtectRequest(
        createRequest({ path: "/api/v1/mails/resendish" }),
        ignoredConfig
      )
    ).toBe(true);
  });

  it("matches full paths when no base path is configured", () => {
    expect(
      shouldProtectRequest(createRequest({ path: "/mails/resend/outbound" }), {
        secret: SECRET,
        ignoredPaths: ["/mails/resend"],
      })
    ).toBe(false);
  });
});

describe("setCsrfCookie", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sets the development cookie with secure defaults", () => {
    const cookie = vi.fn();
    const response = { cookie } as unknown as IResponse;

    setCsrfCookie(response, "token.value");

    expect(cookie).toHaveBeenCalledWith(
      COOKIE_NAME,
      "token.value",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      })
    );
  });

  it("uses the __Host- prefixed cookie in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const cookie = vi.fn();
    const response = { cookie } as unknown as IResponse;

    setCsrfCookie(response, "token.value");

    expect(cookie).toHaveBeenCalledWith(
      "__Host-psifi.x-csrf-token",
      "token.value",
      expect.objectContaining({ secure: true, path: "/" })
    );
  });
});
