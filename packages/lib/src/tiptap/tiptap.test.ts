import { describe, expect, it } from "vitest";

import { tiptapDocSchema } from ".";

const validDoc = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Hello " },
        { type: "mention", attrs: { id: "u1", label: "Jane" } },
      ],
    },
  ],
};

describe("tiptapDocSchema", () => {
  it("accepts a valid Tiptap document", () => {
    expect(tiptapDocSchema.safeParse(validDoc).success).toBe(true);
  });

  it("accepts a doc with no content", () => {
    expect(tiptapDocSchema.safeParse({ type: "doc" }).success).toBe(true);
  });

  it("rejects a root that is not a doc", () => {
    expect(
      tiptapDocSchema.safeParse({ type: "paragraph", content: [] }).success
    ).toBe(false);
  });

  it("rejects a non-array content field", () => {
    expect(
      tiptapDocSchema.safeParse({ type: "doc", content: "nope" }).success
    ).toBe(false);
  });

  it("is usable as a nullable field", () => {
    const schema = tiptapDocSchema.nullable();
    expect(schema.safeParse(null).success).toBe(true);
    expect(schema.safeParse(validDoc).success).toBe(true);
  });
});
