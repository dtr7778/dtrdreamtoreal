import { describe, expect, it } from "vitest";

import { getGroupForAgent, isPathAllowed, parseRobotsTxt } from "./robots";

const ROBOTS = `
# sample
User-agent: *
Disallow: /private/
Disallow: /tmp
Allow: /private/public/

User-agent: GPTBot
Disallow: /

Sitemap: https://example.com/sitemap.xml
`;

describe("parseRobotsTxt", () => {
  it("parses groups, rules and sitemaps", () => {
    const data = parseRobotsTxt(ROBOTS);
    expect(data.groups).toHaveLength(2);
    expect(data.sitemaps).toEqual(["https://example.com/sitemap.xml"]);
  });

  it("finds the most specific group for an agent", () => {
    const data = parseRobotsTxt(ROBOTS);
    const group = getGroupForAgent(data, "GPTBot");
    expect(group?.disallow).toEqual(["/"]);
  });

  it("applies longest-match allow overrides", () => {
    const data = parseRobotsTxt(ROBOTS);
    expect(isPathAllowed(data, "/private/secret", "*")).toBe(false);
    expect(isPathAllowed(data, "/private/public/page", "*")).toBe(true);
    expect(isPathAllowed(data, "/blog", "*")).toBe(true);
  });

  it("blocks a specific agent even when * is allowed", () => {
    const data = parseRobotsTxt(ROBOTS);
    expect(isPathAllowed(data, "/", "GPTBot")).toBe(false);
    expect(isPathAllowed(data, "/", "ClaudeBot")).toBe(true);
  });

  it("honours the end-of-match $ anchor", () => {
    const data = parseRobotsTxt("User-agent: *\nDisallow: /*.pdf$\n");
    expect(isPathAllowed(data, "/docs/file.pdf", "*")).toBe(false);
    expect(isPathAllowed(data, "/docs/file.pdfx", "*")).toBe(true);
  });

  it("does not merge groups across a Sitemap directive", () => {
    const data = parseRobotsTxt(
      [
        "User-agent: A",
        "Disallow: /a",
        "Sitemap: https://example.com/s.xml",
        "User-agent: B",
        "Disallow: /b",
      ].join("\n")
    );

    expect(data.groups).toHaveLength(2);
    expect(data.groups[0]?.disallow).toEqual(["/a"]);
    expect(data.groups[1]?.disallow).toEqual(["/b"]);
  });

  it("matches the user-agent as a prefix, not a substring", () => {
    const data = parseRobotsTxt("User-agent: Bot\nDisallow: /blocked\n");
    // "Bot" must not match "GPTBot"...
    expect(isPathAllowed(data, "/blocked", "GPTBot")).toBe(true);

    const prefix = parseRobotsTxt("User-agent: GPT\nDisallow: /blocked\n");
    // ...but a real product-token prefix does match.
    expect(isPathAllowed(prefix, "/blocked", "GPTBot")).toBe(false);
  });
});
