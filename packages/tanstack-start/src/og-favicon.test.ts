import { describe, expect, it } from "vitest";

import { buildFaviconLinks, buildOgMeta } from "./og-favicon";

describe("buildOgMeta", () => {
  it("emits og and twitter tags from the given values", () => {
    const meta = buildOgMeta({
      appName: "DTR",
      title: "Contact Us | DTR",
      description: "Desc",
      url: "https://dtr.test/contact",
      imageUrl: "https://dtr.test/opengraph-image.jpeg",
    });

    expect(meta).toContainEqual({
      property: "og:title",
      content: "Contact Us | DTR",
    });
    expect(meta).toContainEqual({
      property: "og:url",
      content: "https://dtr.test/contact",
    });
    expect(meta).toContainEqual({
      property: "og:image",
      content: "https://dtr.test/opengraph-image.jpeg",
    });
    expect(meta).toContainEqual({
      name: "twitter:title",
      content: "Contact Us | DTR",
    });
    expect(meta).toContainEqual({
      name: "twitter:card",
      content: "summary_large_image",
    });
  });
});

describe("buildFaviconLinks", () => {
  it("emits manifest, icons and apple-touch-icon", () => {
    const links = buildFaviconLinks();

    expect(links).toContainEqual({
      rel: "manifest",
      href: "/site.webmanifest",
    });
    expect(links).toContainEqual({
      rel: "icon",
      type: "image/svg+xml",
      href: "/favicon.svg",
    });
    expect(links).toContainEqual({
      rel: "apple-touch-icon",
      href: "/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
    });
  });
});
