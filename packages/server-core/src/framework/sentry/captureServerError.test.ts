import { beforeEach, describe, expect, it, vi } from "vitest";

import { captureServerError } from "./captureServerError";

const captureWithContext = vi.hoisted(() => vi.fn());

vi.mock("@workspace/sentry/helpers", () => ({
  captureWithContext: (...args: unknown[]) => captureWithContext(...args),
}));

describe("captureServerError", () => {
  beforeEach(() => vi.clearAllMocks());

  it("captures with backend tag and request context", () => {
    const error = new Error("boom");

    captureServerError(error, {
      requestId: "r1",
      userId: "u1",
      method: "GET",
      route: "/api/v1/things",
    });

    expect(captureWithContext).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        app: "backend",
        tags: expect.objectContaining({
          app: "backend",
          method: "GET",
          route: "/api/v1/things",
        }),
        user: { id: "u1" },
        contexts: expect.objectContaining({
          request: expect.objectContaining({ id: "r1" }),
        }),
      })
    );
  });

  it("omits user and request context when absent", () => {
    captureServerError(new Error("boom"), {});

    const [, context] = captureWithContext.mock.calls[0]!;
    expect(context.user).toBeUndefined();
    expect(context.contexts).toBeUndefined();
  });
});
