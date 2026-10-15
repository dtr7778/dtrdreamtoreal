import { describe, expect, it } from "vitest";

import type { TiptapDoc } from "@workspace/drizzle/schemas";

import { jsonToPlainPreview, jsonToText } from "./chat.content";

function doc(content: Array<Record<string, unknown>>): TiptapDoc {
  return { type: "doc", content } as TiptapDoc;
}

function paragraph(text: string): Record<string, unknown> {
  return { type: "paragraph", content: [{ type: "text", text }] };
}

describe("jsonToText", () => {
  it("returns an empty string for empty input", () => {
    expect(jsonToText(null)).toBe("");
    expect(jsonToText(undefined)).toBe("");
    expect(jsonToText(doc([]))).toBe("");
  });

  it("extracts text from a paragraph", () => {
    expect(jsonToText(doc([paragraph("Hello world")]))).toBe("Hello world");
  });

  it("separates block nodes with newlines", () => {
    expect(jsonToText(doc([paragraph("line1"), paragraph("line2")]))).toBe(
      "line1\nline2"
    );
  });

  it("turns hard breaks into newlines", () => {
    expect(
      jsonToText(
        doc([
          {
            type: "paragraph",
            content: [
              { type: "text", text: "a" },
              { type: "hardBreak" },
              { type: "text", text: "b" },
            ],
          },
        ])
      )
    ).toBe("a\nb");
  });

  it("ignores mark wrappers", () => {
    expect(
      jsonToText(
        doc([
          {
            type: "paragraph",
            content: [
              { type: "text", text: "bold", marks: [{ type: "bold" }] },
              { type: "text", text: " italic" },
            ],
          },
        ])
      )
    ).toBe("bold italic");
  });

  it("renders mentions as @label", () => {
    expect(
      jsonToText(
        doc([
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Hi " },
              { type: "mention", attrs: { id: "u1", label: "Jane" } },
            ],
          },
        ])
      )
    ).toBe("Hi @Jane");
  });

  it("extracts list item text on separate lines", () => {
    expect(
      jsonToText(
        doc([
          {
            type: "bulletList",
            content: [
              { type: "listItem", content: [paragraph("one")] },
              { type: "listItem", content: [paragraph("two")] },
            ],
          },
        ])
      )
    ).toBe("one\ntwo");
  });

  it("extracts code block text", () => {
    expect(
      jsonToText(
        doc([
          {
            type: "codeBlock",
            content: [{ type: "text", text: "const x = 1;" }],
          },
        ])
      )
    ).toBe("const x = 1;");
  });
});

describe("jsonToPlainPreview", () => {
  it("collapses block breaks into a single line", () => {
    expect(jsonToPlainPreview(doc([paragraph("a"), paragraph("b")]))).toBe(
      "a b"
    );
  });

  it("returns an empty string for empty input", () => {
    expect(jsonToPlainPreview(null)).toBe("");
    expect(jsonToPlainPreview(undefined)).toBe("");
  });
});
