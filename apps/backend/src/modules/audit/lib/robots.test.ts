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
});
