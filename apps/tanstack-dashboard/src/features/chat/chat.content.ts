import type { TiptapDoc, TiptapNode } from "@workspace/drizzle/schemas";

const BLOCK_NODE_TYPES = new Set([
  "paragraph",
  "heading",
  "blockquote",
  "codeBlock",
  "listItem",
]);

function mentionLabel(node: TiptapNode): string {
  const label = node.attrs?.label;
  return typeof label === "string" ? `@${label}` : "";
}

function walk(node: TiptapNode): string {
  if (node.type === "text") return node.text ?? "";
  if (node.type === "mention") return mentionLabel(node);
  if (node.type === "hardBreak") return "\n";

  const inner = (node.content ?? []).map(walk).join("");

  return BLOCK_NODE_TYPES.has(node.type) ? `${inner}\n` : inner;
}

/**
 * Extract plain text from a stored Tiptap document, keeping block boundaries as
 * newlines. Mention nodes collapse to their `@label` text.
 */
export function jsonToText(doc: TiptapDoc | null | undefined): string {
  if (!doc?.content?.length) return "";

  const text = doc.content.map(walk).join("");

  return text
    .replace(/[^\S\n]+\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/** Collapse a message body into a single line for compact list previews. */
export function jsonToPlainPreview(doc: TiptapDoc | null | undefined): string {
  return jsonToText(doc).replace(/\s+/g, " ").trim();
}
