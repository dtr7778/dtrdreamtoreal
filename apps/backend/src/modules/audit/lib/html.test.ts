import { describe, expect, it } from "vitest";

import {
  findHttpResources,
  getAnchors,
  getCanonical,
  getHreflangLinks,
  getImages,
  getJsonLdBlocks,
  getMetaByProperty,
  getTitle,
  getWordCount,
  hasNoindexDirective,
} from "./html";

const HTML = `
<!doctype html>
<html lang="en">
<head>
  <title>  Example Page  </title>
  <meta name="robots" content="noindex, follow" />
  <meta property="og:title" content="OG Title" />
  <link rel="canonical" href="https://example.com/page" />
  <link rel="alternate" hreflang="fr" href="https://example.com/fr" />
  <script type="application/ld+json">{ "@type": "Article", "headline": "Hi" }</script>
</head>
<body>
  <h1>Main heading</h1>
  <img src="/a.png" alt="A" loading="lazy" width="10" height="10" />
  <img src="http://insecure.com/b.png" />
  <a href="/about">About us</a>
  <p>Hello world this is some content for word counting.</p>
</body>
</html>
`;

describe("html extraction", () => {
  it("extracts title and og metadata", () => {
    expect(getTitle(HTML)).toBe("Example Page");
    expect(getMetaByProperty(HTML, "og:title")).toBe("OG Title");
  });

  it("extracts canonical and hreflang", () => {
    expect(getCanonical(HTML)).toBe("https://example.com/page");
    expect(getHreflangLinks(HTML)).toEqual([
      { hreflang: "fr", href: "https://example.com/fr" },
    ]);
  });

  it("detects noindex", () => {
    expect(hasNoindexDirective(HTML)).toBe(true);
  });

  it("extracts json-ld and images", () => {
    expect(getJsonLdBlocks(HTML)).toHaveLength(1);
    const images = getImages(HTML);
    expect(images).toHaveLength(2);
    expect(images[0]?.isLazy).toBe(true);
  });

  it("extracts anchors and counts words", () => {
    const anchors = getAnchors(HTML);
    expect(anchors[0]?.href).toBe("/about");
    expect(anchors[0]?.text).toBe("About us");
    expect(getWordCount(HTML)).toBeGreaterThan(5);
  });

  it("finds insecure http resources", () => {
    expect(findHttpResources(HTML)).toEqual(["http://insecure.com/b.png"]);
  });
});
