import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  appTag,
  isSentryEnabled,
  isSpotlightEnabled,
  normalizeDsn,
  resolveDataCollection,
  resolveEnvironment,
  resolveLogLevels,
  resolveRelease,
  resolveSpotlight,
  resolveTracesSampleRate,
  scrubEvent,
} from "./config";

const SENTRY_ENV_KEYS = [
  "SENTRY_DISABLED",
  "SENTRY_DSN",
  "SENTRY_ENVIRONMENT",
  "SENTRY_RELEASE",
  "SENTRY_TRACES_SAMPLE_RATE",
  "SENTRY_SPOTLIGHT",
  "NODE_ENV",
] as const;

describe("sentry config", () => {
  const original: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of SENTRY_ENV_KEYS) {
      original[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of SENTRY_ENV_KEYS) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  });

  it("is disabled without a dsn", () => {
    expect(isSentryEnabled(undefined)).toBe(false);
    expect(isSentryEnabled("")).toBe(false);
    expect(isSentryEnabled("  ")).toBe(false);
  });

  it("is disabled when SENTRY_DISABLED is true even with a dsn", () => {
    process.env.SENTRY_DISABLED = "true";
    expect(isSentryEnabled("https://key@sentry.io/1")).toBe(false);
  });

  it("is enabled with a dsn", () => {
    expect(isSentryEnabled("https://key@sentry.io/1")).toBe(true);
  });

  it("resolves environment from SENTRY_ENVIRONMENT then NODE_ENV", () => {
    process.env.NODE_ENV = "production";
    expect(resolveEnvironment()).toBe("production");
    process.env.SENTRY_ENVIRONMENT = "staging";
    expect(resolveEnvironment()).toBe("staging");
  });

  it("resolves release only when set", () => {
    expect(resolveRelease()).toBeUndefined();
    process.env.SENTRY_RELEASE = "abc123";
    expect(resolveRelease()).toBe("abc123");
  });

  it("resolves trace sample rates with env override and defaults", () => {
    expect(resolveTracesSampleRate("production")).toBe(0.1);
    expect(resolveTracesSampleRate("test")).toBe(0);
    expect(resolveTracesSampleRate("development")).toBe(1);
    process.env.SENTRY_TRACES_SAMPLE_RATE = "0.25";
    expect(resolveTracesSampleRate("production")).toBe(0.25);
    process.env.SENTRY_TRACES_SAMPLE_RATE = "not-a-number";
    expect(resolveTracesSampleRate("production")).toBe(0.1);
  });

  it("floors log levels at warn in production", () => {
    expect(resolveLogLevels("production")).toEqual(["warn", "error", "fatal"]);
    expect(resolveLogLevels("development")).toContain("debug");
  });

  it("tags the app", () => {
    expect(appTag("web")).toEqual({ app: "web" });
  });

  it("disables all optional data collection", () => {
    const dataCollection = resolveDataCollection();

    expect(dataCollection.userInfo).toBe(false);
    expect(dataCollection.cookies).toBe(false);
    expect(dataCollection.httpBodies).toEqual([]);
    expect(dataCollection.urlQueryParams).toBe(false);
    expect(dataCollection.httpHeaders).toEqual({
      request: false,
      response: false,
    });
  });

  it("drops events with neither exception nor message", () => {
    expect(scrubEvent({} as never)).toBeNull();
    expect(scrubEvent({ message: "  " } as never)).toBeNull();
  });

  it("keeps events with an exception", () => {
    const event = { exception: { values: [{ type: "Error" }] } };
    expect(scrubEvent(event as never)).toBe(event);
  });

  it("strips request bodies and cookies and redacts sensitive headers", () => {
    const event = {
      message: "boom",
      request: {
        data: { password: "hunter2" },
        cookies: { session: "abc" },
        headers: {
          authorization: "Bearer secret",
          cookie: "session=abc",
          "set-cookie": "a=b",
          "x-api-key": "key",
          "user-agent": "vitest",
        },
      },
    };

    const result = scrubEvent(event as never) as unknown as typeof event;

    expect(result.request).not.toHaveProperty("data");
    expect(result.request).not.toHaveProperty("cookies");
    expect(result.request.headers.authorization).toBe("[REDACTED]");
    expect(result.request.headers.cookie).toBe("[REDACTED]");
    expect(result.request.headers["set-cookie"]).toBe("[REDACTED]");
    expect(result.request.headers["x-api-key"]).toBe("[REDACTED]");
    expect(result.request.headers["user-agent"]).toBe("vitest");
  });

  it("normalizes empty dsn values to undefined", () => {
    expect(normalizeDsn(undefined)).toBeUndefined();
    expect(normalizeDsn("")).toBeUndefined();
    expect(normalizeDsn("   ")).toBeUndefined();
    expect(normalizeDsn("https://key@sentry.io/1")).toBe(
      "https://key@sentry.io/1"
    );
  });

  it("resolves spotlight from the env var", () => {
    expect(resolveSpotlight(undefined)).toBeUndefined();
    expect(resolveSpotlight("")).toBeUndefined();
    expect(resolveSpotlight("true")).toBe(true);
    expect(resolveSpotlight("1")).toBe(true);
    expect(resolveSpotlight("false")).toBe(false);
    expect(resolveSpotlight("0")).toBe(false);
    expect(resolveSpotlight("http://localhost:8969/stream")).toBe(
      "http://localhost:8969/stream"
    );
  });

  it("detects whether spotlight is enabled", () => {
    expect(isSpotlightEnabled(undefined)).toBe(false);
    expect(isSpotlightEnabled("")).toBe(false);
    expect(isSpotlightEnabled("false")).toBe(false);
    expect(isSpotlightEnabled("0")).toBe(false);
    expect(isSpotlightEnabled("true")).toBe(true);
    expect(isSpotlightEnabled("http://localhost:8969/stream")).toBe(true);
  });
});
