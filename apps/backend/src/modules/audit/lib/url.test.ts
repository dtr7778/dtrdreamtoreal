import { describe, expect, it } from "vitest";

import {
  getHostVariants,
  getUrlDepth,
  isInternalLink,
  lintUrl,
  normalizeUrl,
} from "./url";

describe("lintUrl", () => {
  it("flags uppercase, session ids and non-https", () => {
    const issues = lintUrl("http://Example.com/My_Page?sid=abc");
    const codes = issues.map((issue) => issue.code);
    expect(codes).toContain("uppercase-path");
    expect(codes).toContain("session-id");
    expect(codes).toContain("underscore-separator");
    expect(codes).toContain("not-https");
  });

  it("returns no issues for a clean https url", () => {
    expect(lintUrl("https://example.com/blog/my-post")).toEqual([]);
  });
});

describe("normalizeUrl", () => {
  it("removes trailing slash and hash", () => {
    expect(normalizeUrl("https://example.com/blog/#top")).toBe(
      "https://example.com/blog"
    );
  });
});

describe("isInternalLink", () => {
  it("detects same-origin links and ignores anchors", () => {
    expect(isInternalLink("/about", "https://example.com")).toBe(true);
    expect(isInternalLink("https://other.com", "https://example.com")).toBe(
      false
    );
    expect(isInternalLink("#section", "https://example.com")).toBe(false);
  });
});

describe("getHostVariants", () => {
  it("builds www and non-www variants", () => {
    const variants = getHostVariants("https://www.example.com/a");
    expect(variants?.httpsNonWww).toBe("https://example.com/a");
    expect(variants?.httpWww).toBe("http://www.example.com/a");
  });
});

describe("getUrlDepth", () => {
  it("counts path segments", () => {
    expect(getUrlDepth("https://example.com/a/b/c")).toBe(3);
    expect(getUrlDepth("https://example.com/")).toBe(0);
  });
});
