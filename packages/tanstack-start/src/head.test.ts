import { describe, expect, it } from "vitest";
import { buildHead } from "./head";

const config = {
  appName: "DTR",
  siteUrl: "https://dtr.test/",
  defaultTitle: "DTR - Dream To Real",
  titleTemplate: "%s | DTR",
  description: "Site description",
  themeColor: "#9f0712",
};

function find(
  entries: Array<Record<string, string>>,
  key: string,
  value: string,
) {
  return entries.find((entry) => entry[key] === value);
}

describe("buildHead", () => {
  it("globalHead sets title and description from config", () => {
    const { globalHead } = buildHead(config);
    const result = globalHead();
    expect(find(result.meta, "title", config.defaultTitle)).toBeDefined();
    expect(find(result.meta, "name", "description")?.content).toBe(
      config.description,
    );
  });

  it("head applies the title template to titleByTemplate", () => {
    const { head } = buildHead(config);
    const result = head({ titleByTemplate: "Contact Us", pathname: "/contact" });
    expect(find(result.meta, "title", "Contact Us | DTR")).toBeDefined();
    expect(find(result.meta, "property", "og:title")?.content).toBe(
      "Contact Us | DTR",
    );
    expect(find(result.meta, "name", "twitter:title")?.content).toBe(
      "Contact Us | DTR",
    );
  });

  it("head uses title as-is without applying the template", () => {
    const { head } = buildHead(config);
    const result = head({ title: "Raw | Title", pathname: "/x" });
    expect(find(result.meta, "title", "Raw | Title")).toBeDefined();
  });

  it("head keeps special replacement patterns literal in titleByTemplate", () => {
    const { head } = buildHead(config);
    const result = head({ titleByTemplate: "Price $& $1", pathname: "/x" });
    expect(find(result.meta, "title", "Price $& $1 | DTR")).toBeDefined();
  });

  it("head sets canonical and og:url from pathname", () => {
    const { head } = buildHead(config);
    const result = head({ titleByTemplate: "A", pathname: "/contact" });
    expect(find(result.links, "rel", "canonical")?.href).toBe(
      "https://dtr.test/contact",
    );
    expect(find(result.meta, "property", "og:url")?.content).toBe(
      "https://dtr.test/contact",
    );
  });

  it("head uses the bare site url as canonical for the root path", () => {
    const { head } = buildHead(config);
    const result = head({ titleByTemplate: "A", pathname: "/" });
    expect(find(result.links, "rel", "canonical")?.href).toBe(
      "https://dtr.test",
    );
  });

  it("head uses a page description when provided", () => {
    const { head } = buildHead(config);
    const result = head({
      titleByTemplate: "A",
      pathname: "/x",
      description: "Page desc",
    });
    expect(find(result.meta, "name", "description")?.content).toBe("Page desc");
    expect(find(result.meta, "property", "og:description")?.content).toBe(
      "Page desc",
    );
  });

  it("head falls back to the config description", () => {
    const { head } = buildHead(config);
    const result = head({ titleByTemplate: "A", pathname: "/x" });
    expect(find(result.meta, "name", "description")?.content).toBe(
      config.description,
    );
  });

  it("omits social tags when social is false", () => {
    const { head } = buildHead({ ...config, social: false });
    const result = head({ title: "A", pathname: "/x" });
    expect(
      result.meta.some((entry) => entry.property?.startsWith("og:")),
    ).toBe(false);
    expect(
      result.meta.some((entry) => entry.name?.startsWith("twitter:")),
    ).toBe(false);
  });

  it("throws when titleTemplate has no %s placeholder", () => {
    expect(() =>
      buildHead({ ...config, titleTemplate: "No placeholder" }),
    ).toThrow();
  });

  it("globalHead includes theme-color and manifest link", () => {
    const { globalHead } = buildHead(config);
    const result = globalHead();
    expect(find(result.meta, "name", "theme-color")?.content).toBe(
      config.themeColor,
    );
    expect(find(result.links, "rel", "manifest")?.href).toBe(
      "/site.webmanifest",
    );
  });

  it("globalHead includes configured stylesheets", () => {
    const { globalHead } = buildHead({ ...config, stylesheets: ["/a.css"] });
    expect(globalHead().links).toContainEqual({
      rel: "stylesheet",
      href: "/a.css",
    });
  });
});
