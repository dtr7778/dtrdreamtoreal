import { StatusCodes } from "http-status-codes";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "../classes";
import { errorMiddleware } from "./error.middleware";

const captureServerError = vi.hoisted(() => vi.fn());

vi.mock("../sentry", () => ({
  captureServerError: (...args: unknown[]) => captureServerError(...args),
}));

function createRes() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { headersSent: false, status, json } as never;
}

describe("errorMiddleware sentry capture", () => {
  beforeEach(() => vi.clearAllMocks());

  it("captures 5xx server errors", () => {
    errorMiddleware(
      new Error("boom"),
      { method: "GET", originalUrl: "/x", id: "r1" } as never,
      createRes(),
      vi.fn()
    );

    expect(captureServerError).toHaveBeenCalledTimes(1);
  });

  it("does not capture 4xx client errors", () => {
    errorMiddleware(
      new ApiError({
        statusCode: StatusCodes.BAD_REQUEST,
        message: "bad",
      }),
      {} as never,
      createRes(),
      vi.fn()
    );

    expect(captureServerError).not.toHaveBeenCalled();
  });
});
