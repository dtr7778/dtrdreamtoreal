import { describe, expect, it, vi } from "vitest";

import type { IRequest, IResponse } from "../types";
import {
  generateCsrfToken,
  resolveCsrfConfig,
  setCsrfCookie,
  shouldProtectRequest,
  validateCsrfToken,
} from "./csrf";

const SECRET = "test-secret";
const COOKIE_NAME = "x-csrf-token";

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
    headers: { "x-csrf-token": token },
  });
}

describe("generateCsrfToken", () => {
  it("generates an hmac.random token", () => {
    const token = generateCsrfToken(createRequest(), {
      secret: SECRET,
      cookieName: COOKIE_NAME,
    });

    expect(token).toMatch(/^[a-f0-9]+\.[a-f0-9]+$/);
  });

  it("generates tokens of the configured size", () => {
    const token = generateCsrfToken(createRequest(), {
      secret: SECRET,
      cookieName: COOKIE_NAME,
      size: 16,
    });

    const [, randomValue] = token.split(".");
    expect(randomValue).toHaveLength(32);
  });

  it("reuses an existing valid cookie token", () => {
    const request = createRequest();
    const token = generateCsrfToken(request, {
      secret: SECRET,
      cookieName: COOKIE_NAME,
    });

    const withCookie = createRequest({
      cookies: { [COOKIE_NAME]: token },
    });

    expect(
      generateCsrfToken(withCookie, { secret: SECRET, cookieName: COOKIE_NAME })
    ).toBe(token);
  });

  it("generates a new token when overwrite is true", () => {
    const request = createRequest();
    const token = generateCsrfToken(request, {
      secret: SECRET,
      cookieName: COOKIE_NAME,
    });
    const withCookie = createRequest({ cookies: { [COOKIE_NAME]: token } });

    const regenerated = generateCsrfToken(withCookie, {
      secret: SECRET,
      cookieName: COOKIE_NAME,
      overwrite: true,
    });

    expect(regenerated).not.toBe(token);
  });

  it("generates a new token when the existing cookie is invalid", () => {
    const withCookie = createRequest({
      cookies: { [COOKIE_NAME]: "invalid.token" },
    });

    const token = generateCsrfToken(withCookie, {
      secret: SECRET,
      cookieName: COOKIE_NAME,
    });

    expect(token).not.toBe("invalid.token");
    expect(
      validateCsrfToken(authorizeRequest(token), {
        secret: SECRET,
        cookieName: COOKIE_NAME,
      })
    ).toBe(true);
  });

  it("binds the token to the session identifier", () => {
    const token = generateCsrfToken(createRequest({ ip: "1.1.1.1" }), {
      secret: SECRET,
      cookieName: COOKIE_NAME,
    });

    const otherSession = createRequest({
      ip: "2.2.2.2",
      cookies: { [COOKIE_NAME]: token },
      headers: { "x-csrf-token": token },
    });

    expect(
      validateCsrfToken(otherSession, {
        secret: SECRET,
        cookieName: COOKIE_NAME,
      })
    ).toBe(false);
  });
});

describe("validateCsrfToken", () => {
  const config = { secret: SECRET, cookieName: COOKIE_NAME };

  function validToken() {
    return generateCsrfToken(createRequest(), config);
  }

  it("accepts a matching cookie and header", () => {
    const token = validToken();
    expect(validateCsrfToken(authorizeRequest(token), config)).toBe(true);
  });

  it("rejects when the header is missing", () => {
    const token = validToken();
    const request = createRequest({ cookies: { [COOKIE_NAME]: token } });
    expect(validateCsrfToken(request, config)).toBe(false);
  });

  it("rejects when the cookie is missing", () => {
    const token = validToken();
    const request = createRequest({ headers: { "x-csrf-token": token } });
    expect(validateCsrfToken(request, config)).toBe(false);
  });

  it("rejects when cookie and header differ", () => {
    const token = validToken();
    const request = createRequest({
      cookies: { [COOKIE_NAME]: token },
      headers: { "x-csrf-token": `${token}x` },
    });
    expect(validateCsrfToken(request, config)).toBe(false);
  });

  it("rejects a tampered hmac", () => {
    const token = validToken();
    const [, randomValue] = token.split(".");
    const tampered = `deadbeef.${randomValue}`;
    expect(validateCsrfToken(authorizeRequest(tampered), config)).toBe(false);
  });

  it("rejects a tampered random value", () => {
    const token = validToken();
    const [hmac] = token.split(".");
    expect(
      validateCsrfToken(authorizeRequest(`${hmac}.deadbeef`), config)
    ).toBe(false);
  });

  it("rejects an empty cookie value", () => {
    expect(validateCsrfToken(authorizeRequest(""), config)).toBe(false);
  });

  it("rejects a token signed with a different secret", () => {
    const token = validToken();
    expect(
      validateCsrfToken(authorizeRequest(token), {
        secret: "another-secret",
        cookieName: COOKIE_NAME,
      })
    ).toBe(false);
  });
});

describe("shouldProtectRequest", () => {
  const config = { secret: SECRET, cookieName: COOKIE_NAME };

  it.each(["GET", "HEAD", "OPTIONS"])("skips %s requests", (method) => {
    expect(shouldProtectRequest(createRequest({ method }), config)).toBe(false);
  });

  it.each(["POST", "PUT", "PATCH", "DELETE"])(
    "protects %s requests",
    (method) => {
      expect(shouldProtectRequest(createRequest({ method }), config)).toBe(
        true
      );
    }
  );

  describe("ignoredPaths", () => {
    const ignoredConfig = {
      secret: SECRET,
      cookieName: COOKIE_NAME,
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
        shouldProtectRequest(
          createRequest({ path: "/mails/resend/outbound" }),
          {
            secret: SECRET,
            cookieName: COOKIE_NAME,
            ignoredPaths: ["/mails/resend"],
          }
        )
      ).toBe(false);
    });

    it("supports a custom skipCsrfProtection predicate", () => {
      expect(
        shouldProtectRequest(createRequest({ path: "/anything" }), {
          secret: SECRET,
          cookieName: COOKIE_NAME,
          skipCsrfProtection: () => true,
        })
      ).toBe(false);
    });
  });
});

describe("setCsrfCookie", () => {
  it("sets the cookie with the configured name and options", () => {
    const cookie = vi.fn();
    const response = { cookie } as unknown as IResponse;
    const resolved = resolveCsrfConfig({
      secret: SECRET,
      cookieName: COOKIE_NAME,
      cookieOptions: { httpOnly: true, path: "/" },
    });

    setCsrfCookie(response, "token.value", resolved);

    expect(cookie).toHaveBeenCalledWith(
      COOKIE_NAME,
      "token.value",
      expect.objectContaining({ httpOnly: true, path: "/" })
    );
  });
});
