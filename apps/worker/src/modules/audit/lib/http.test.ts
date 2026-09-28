import type { AxiosResponse } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

import { httpClient } from "@workspace/server-core/lib";

import { httpFetch } from "./http";

function response(partial: {
  status: number;
  headers?: Record<string, string>;
  data?: string;
}): AxiosResponse<string> {
  return {
    status: partial.status,
    statusText: "",
    headers: partial.headers ?? {},
    data: partial.data ?? "",
    config: {} as AxiosResponse["config"],
  } as AxiosResponse<string>;
}

describe("httpFetch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("follows redirects manually and records the chain", async () => {
    const request = vi.spyOn(httpClient, "request");
    request
      .mockResolvedValueOnce(
        response({ status: 301, headers: { location: "/next" } })
      )
      .mockResolvedValueOnce(
        response({
          status: 200,
          headers: { "content-type": "text/html" },
          data: "<html>ok</html>",
        })
      );

    const result = await httpFetch("https://example.com/");

    expect(result.finalUrl).toBe("https://example.com/next");
    expect(result.status).toBe(200);
    expect(result.ok).toBe(true);
    expect(result.body).toBe("<html>ok</html>");
    expect(result.contentType).toBe("text/html");
    expect(result.redirectCount).toBe(1);
    expect(result.redirectChain).toEqual([
      { url: "https://example.com/", status: 301, location: "/next" },
    ]);
    expect(result.loopDetected).toBe(false);
    expect(result.error).toBeNull();

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ maxRedirects: 0, method: "GET" })
    );
  });

  it("flags redirect loops", async () => {
    vi.spyOn(httpClient, "request").mockResolvedValue(
      response({ status: 302, headers: { location: "https://example.com/" } })
    );

    const result = await httpFetch("https://example.com/");

    expect(result.loopDetected).toBe(true);
    expect(result.redirectCount).toBe(1);
  });

  it("captures request errors", async () => {
    vi.spyOn(httpClient, "request").mockRejectedValue(new Error("boom"));

    const result = await httpFetch("https://example.com/");

    expect(result.error).toBe("boom");
    expect(result.status).toBe(0);
  });

  it("returns an empty body for HEAD requests", async () => {
    vi.spyOn(httpClient, "request").mockResolvedValue(
      response({ status: 200, data: "ignored" })
    );

    const result = await httpFetch("https://example.com/", { method: "HEAD" });

    expect(result.body).toBe("");
  });
});
