import { beforeEach, describe, expect, it, vi } from "vitest";

import { captureWithContext } from "./helpers";

const { scopeMock, captureException, withScope } = vi.hoisted(() => {
  const scopeMock = {
    setTag: vi.fn(),
    setTags: vi.fn(),
    setUser: vi.fn(),
    setContext: vi.fn(),
  };

  return {
    scopeMock,
    withScope: vi.fn((cb: (scope: unknown) => void) => cb(scopeMock)),
    captureException: vi.fn(),
  };
});

vi.mock("@sentry/core", () => ({
  withScope: (cb: (scope: unknown) => void) => withScope(cb),
  captureException: (...args: unknown[]) => captureException(...args),
}));

describe("captureWithContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("captures the error with tags, user and contexts", () => {
    const error = new Error("boom");

    captureWithContext(error, {
      app: "backend",
      tags: { route: "/x" },
      user: { id: "u1" },
      contexts: { requestMeta: { id: "r1" } },
    });

    expect(captureException).toHaveBeenCalledWith(error);
    expect(scopeMock.setTag).toHaveBeenCalledWith("app", "backend");
    expect(scopeMock.setTags).toHaveBeenCalledWith({ route: "/x" });
    expect(scopeMock.setUser).toHaveBeenCalledWith({ id: "u1" });
    expect(scopeMock.setContext).toHaveBeenCalledWith("requestMeta", {
      id: "r1",
    });
  });

  it("omits user when no id is provided", () => {
    captureWithContext(new Error("boom"));

    expect(scopeMock.setUser).not.toHaveBeenCalled();
    expect(captureException).toHaveBeenCalledTimes(1);
  });
});
