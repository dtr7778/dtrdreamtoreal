import { describe, expect, it } from "vitest";

import { sanitizeUploadedMarkup } from "./file-sanitizer";

describe("sanitizeUploadedMarkup (html)", () => {
  it("removes script tags and their content", () => {
    const output = sanitizeUploadedMarkup(
      "<p>Hi</p><script>alert(1)</script>",
      "html"
    );

    expect(output).toContain("<p>Hi</p>");
    expect(output).not.toContain("script");
    expect(output).not.toContain("alert");
  });

  it("removes event handler attributes", () => {
    const output = sanitizeUploadedMarkup(
      '<img src="https://example.com/a.png" onerror="alert(1)">',
      "html"
    );

    expect(output).toContain('src="https://example.com/a.png"');
    expect(output).not.toContain("onerror");
  });

  it("removes javascript: links", () => {
    const output = sanitizeUploadedMarkup(
      '<a href="javascript:alert(1)">click</a>',
      "html"
    );

    expect(output).not.toContain("javascript:");
  });

  it("keeps a full document structure and safe content", () => {
    const output = sanitizeUploadedMarkup(
      "<html><head><title>Report</title></head><body><h1>Q1</h1></body></html>",
      "html"
    );

    expect(output).toContain("<title>Report</title>");
    expect(output).toContain("<h1>Q1</h1>");
  });
});

describe("sanitizeUploadedMarkup (svg)", () => {
  it("removes script elements and event handlers", () => {
    const output = sanitizeUploadedMarkup(
      '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(2)</script><rect width="10" height="10"/></svg>',
      "svg"
    );

    expect(output).not.toContain("script");
    expect(output).not.toContain("onload");
    expect(output).not.toContain("alert");
    expect(output).toContain("<rect");
  });

  it("removes foreignObject content", () => {
    const output = sanitizeUploadedMarkup(
      '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject><div onclick="alert(1)">x</div></foreignObject></svg>',
      "svg"
    );

    expect(output).not.toContain("foreignObject");
    expect(output).not.toContain("onclick");
  });

  it("keeps camelCase SVG element names so gradients still render", () => {
    const output = sanitizeUploadedMarkup(
      '<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"><stop offset="0" stop-color="red"/></linearGradient></defs><rect fill="url(#g)" width="10" height="10"/></svg>',
      "svg"
    );

    expect(output).toContain("<linearGradient");
    expect(output).toContain("<stop");
  });

  it("keeps sibling shapes separate after self-closing tags", () => {
    const output = sanitizeUploadedMarkup(
      '<svg xmlns="http://www.w3.org/2000/svg"><circle r="5"/><rect width="10" height="10"/></svg>',
      "svg"
    );

    expect(output).toMatch(/<\/circle>\s*<rect/);
  });

  it("removes javascript: hrefs", () => {
    const output = sanitizeUploadedMarkup(
      '<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)"><text>x</text></a></svg>',
      "svg"
    );

    expect(output).not.toContain("javascript:");
  });
});
