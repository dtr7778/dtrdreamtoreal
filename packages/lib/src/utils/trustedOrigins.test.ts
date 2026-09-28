import { describe, expect, it } from "vitest";

import { expandTrustedOrigins } from "./trustedOrigins";

describe("expandTrustedOrigins", () => {
  it("expands a bare apex origin into apex and www variants", () => {
    expect(expandTrustedOrigins("https://example.com")).toEqual([
      "https://example.com",
      "https://www.example.com",
    ]);
  });

  it("expands a www origin into www and apex variants", () => {
    expect(expandTrustedOrigins("https://www.example.com")).toEqual([
      "https://www.example.com",
      "https://example.com",
    ]);
  });

  it("preserves the protocol", () => {
    expect(expandTrustedOrigins("http://localhost:3000")).toEqual([
      "http://localhost:3000",
      "http://www.localhost:3000",
    ]);
  });

  it("expands every entry of a list and de-duplicates", () => {
    expect(
      expandTrustedOrigins([
        "https://example.com",
        "https://www.example.com",
        "https://other.com",
      ])
    ).toEqual([
      "https://example.com",
      "https://www.example.com",
      "https://other.com",
      "https://www.other.com",
    ]);
  });

  it("keeps wildcard patterns untouched", () => {
    expect(expandTrustedOrigins("https://*.example.com")).toEqual([
      "https://*.example.com",
    ]);
  });

  it("keeps unparseable values untouched", () => {
    expect(expandTrustedOrigins("not a url")).toEqual(["not a url"]);
  });
});
