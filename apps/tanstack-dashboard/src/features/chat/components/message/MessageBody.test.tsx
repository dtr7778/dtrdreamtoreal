import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { TiptapDoc } from "@workspace/drizzle/schemas";

import { MessageBody } from "./MessageBody";

function doc(content: Array<Record<string, unknown>>): TiptapDoc {
  return { type: "doc", content } as TiptapDoc;
}

function paragraph(
  text: string,
  marks: Array<Record<string, unknown>> = []
): Record<string, unknown> {
  return { type: "paragraph", content: [{ type: "text", text, marks }] };
}

function render(d: TiptapDoc | null | undefined): string {
  return renderToStaticMarkup(<MessageBody doc={d} />);
}

describe("MessageBody", () => {
  it("renders nothing for empty input", () => {
    expect(render(null)).toBe("");
    expect(render(undefined)).toBe("");
    expect(render(doc([]))).toBe("");
  });

  it("renders paragraph text", () => {
    expect(render(doc([paragraph("Hello world")]))).toContain("Hello world");
  });

  it("escapes HTML-looking text instead of rendering it", () => {
    const html = render(doc([paragraph("<script>alert(1)</script>")]));
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("renders formatting marks", () => {
    const html = render(
      doc([
        paragraph("x", [
          { type: "bold" },
          { type: "italic" },
          { type: "strike" },
          { type: "code" },
        ]),
      ])
    );
    expect(html).toContain("<strong>");
    expect(html).toContain("<em>");
    expect(html).toContain("<s>");
    expect(html).toContain("<code>");
  });

  it("forces safe target and rel on links", () => {
    const html = render(
      doc([
        paragraph("link", [
          { type: "link", attrs: { href: "https://example.com" } },
        ]),
      ])
    );
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer nofollow"');
  });

  it("drops links without a string href", () => {
    const html = render(
      doc([paragraph("link", [{ type: "link", attrs: { href: 42 } }])])
    );
    expect(html).not.toContain("<a ");
    expect(html).toContain("link");
  });

  it("renders mentions as @label", () => {
    const html = render(
      doc([
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Hi " },
            { type: "mention", attrs: { id: "u1", label: "Jane" } },
          ],
        },
      ])
    );
    expect(html).toContain("chat-mention");
    expect(html).toContain("@Jane");
  });

  it("renders hard breaks and lists", () => {
    const html = render(
      doc([
        {
          type: "paragraph",
          content: [
            { type: "text", text: "a" },
            { type: "hardBreak" },
            { type: "text", text: "b" },
          ],
        },
        {
          type: "bulletList",
          content: [
            { type: "listItem", content: [paragraph("one")] },
            { type: "listItem", content: [paragraph("two")] },
          ],
        },
      ])
    );
    expect(html).toContain("<br/>");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>");
  });

  it("ignores unknown node types", () => {
    const html = render(doc([{ type: "mystery", content: [paragraph("no")] }]));
    expect(html).not.toContain("no");
    expect(html).not.toContain("mystery");
  });
});
