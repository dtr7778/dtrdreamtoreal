import { describe, expect, it, vi } from "vitest";

import type { IRequestExecutionContext } from "../types";

const mocks = vi.hoisted(() => {
  const httpLogger = vi.fn();
  return { httpLogger, pinoHttp: vi.fn(() => httpLogger) };
});

vi.mock("pino-http", () => ({ pinoHttp: mocks.pinoHttp }));
vi.mock("../../logger", () => ({ logger: vi.fn(() => ({})) }));

import { LoggerInterceptor } from "./logger.interceptor";

describe("LoggerInterceptor", () => {
  it("attaches the pino-http handler and continues the pipeline", async () => {
    const interceptor = new LoggerInterceptor({
      serviceName: "test",
      logLevel: "info",
    });

    const request = {} as IRequestExecutionContext["request"];
    const response = {} as IRequestExecutionContext["response"];
    const next = vi.fn(async () => "result");

    const result = await interceptor.intercept(
      { request, response } as IRequestExecutionContext,
      next
    );

    expect(mocks.pinoHttp).toHaveBeenCalledTimes(1);
    expect(mocks.httpLogger).toHaveBeenCalledWith(
      request,
      response,
      expect.any(Function)
    );
    expect(next).toHaveBeenCalledTimes(1);
    expect(result).toBe("result");
  });
});
