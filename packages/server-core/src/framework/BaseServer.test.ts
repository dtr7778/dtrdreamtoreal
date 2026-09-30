import { Container } from "inversify";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BaseServer, type BaseServerConfig } from "./BaseServer";

const { calls } = vi.hoisted(() => ({ calls: [] as string[] }));

vi.mock("./middlewares", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./middlewares")>();

  return {
    ...actual,
    corsMiddleware: (...args: Parameters<typeof actual.corsMiddleware>) => {
      calls.push("corsMiddleware");
      return actual.corsMiddleware(...args);
    },
    nonceMiddleware: (...args: Parameters<typeof actual.nonceMiddleware>) => {
      calls.push("nonceMiddleware");
      return actual.nonceMiddleware(...args);
    },
    jsonMiddleware: (...args: Parameters<typeof actual.jsonMiddleware>) => {
      calls.push("jsonMiddleware");
      return actual.jsonMiddleware(...args);
    },
    urlEncoderMiddleware: (
      ...args: Parameters<typeof actual.urlEncoderMiddleware>
    ) => {
      calls.push("urlEncoderMiddleware");
      return actual.urlEncoderMiddleware(...args);
    },
  };
});

vi.mock("./middlewares/helmet.middleware", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./middlewares/helmet.middleware")>();

  return {
    ...actual,
    helmetMiddleware: (
      ...args: Parameters<typeof actual.helmetMiddleware>
    ) => {
      calls.push("helmetMiddleware");
      return actual.helmetMiddleware(...args);
    },
  };
});

vi.mock("./middlewares/rateLimit.middleware", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./middlewares/rateLimit.middleware")>();

  return {
    ...actual,
    rateLimitMiddleware: (
      ...args: Parameters<typeof actual.rateLimitMiddleware>
    ) => {
      calls.push("rateLimitMiddleware");
      return actual.rateLimitMiddleware(...args);
    },
  };
});

vi.mock("./services/ControllerLoader.service", () => ({
  ControllerLoader: {
    loadAllControllers: () => {
      calls.push("loadAllControllers");
    },
  },
}));

class TestServer extends BaseServer {
  protected init(): void {}
}

function buildServer(): void {
  const config: BaseServerConfig = {
    title: "Test",
    container: new Container(),
    controllerClasses: [],
    version: "0.0.0",
    basePath: "/api/v1",
    corsConfig: { allowedOrigins: [] },
    csrfConfig: { secret: "test-secret" },
    rateLimitConfig: {
      requests: 10,
      window: "10 s",
      redisClient: { call: async () => "OK" } as never,
    },
    enableOpenApiDocs: false,
    beforeSecurityMiddleware: () => calls.push("hook:beforeSecurityMiddleware"),
    beforeCookieParser: () => calls.push("hook:beforeCookieParser"),
    beforeRateLimit: () => calls.push("hook:beforeRateLimit"),
    beforeBodyParser: () => calls.push("hook:beforeBodyParser"),
    afterBodyParser: () => calls.push("hook:afterBodyParser"),
    beforeControllers: () => calls.push("hook:beforeControllers"),
    afterControllers: () => calls.push("hook:afterControllers"),
  };

  new TestServer(config);
}

describe("BaseServer injectors", () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it("runs each injector at its position in the middleware chain", () => {
    buildServer();

    expect(calls).toEqual([
      "hook:beforeSecurityMiddleware",
      "corsMiddleware",
      "nonceMiddleware",
      "helmetMiddleware",
      "hook:beforeCookieParser",
      "hook:beforeRateLimit",
      "rateLimitMiddleware",
      "hook:beforeBodyParser",
      "jsonMiddleware",
      "hook:afterBodyParser",
      "urlEncoderMiddleware",
      "hook:beforeControllers",
      "loadAllControllers",
      "hook:afterControllers",
    ]);
  });

  it("does not require any injector", () => {
    const config: BaseServerConfig = {
      title: "Test",
      container: new Container(),
      controllerClasses: [],
      version: "0.0.0",
      basePath: "/api/v1",
      corsConfig: { allowedOrigins: [] },
      csrfConfig: { secret: "test-secret" },
      rateLimitConfig: {
        requests: 10,
        window: "10 s",
        redisClient: { call: async () => "OK" } as never,
      },
      enableOpenApiDocs: false,
    };

    expect(() => new TestServer(config)).not.toThrow();
  });
});