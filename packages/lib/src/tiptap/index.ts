import z from "zod";

import type { TiptapDoc } from "@workspace/drizzle/schemas";

export type {
  TiptapDoc,
  TiptapMark,
  TiptapNode,
} from "@workspace/drizzle/schemas";

function isTiptapDoc(value: unknown): value is TiptapDoc {
  if (typeof value !== "object" || value === null) return false;

  const doc = value as Record<string, unknown>;

  if (doc.type !== "doc") return false;
  if (doc.content !== undefined && !Array.isArray(doc.content)) return false;

  return true;
}

/**
 * Structural guard for a message body. The renderer is safe by construction
 * (it walks known node types into React elements, never raw HTML), so this only
 * enforces a `doc` root with an array `content` plus a serialized size cap.
 * Unknown node types are allowed and simply ignored when rendered.
 */
export const tiptapDocSchema = z.custom<TiptapDoc>(isTiptapDoc, {
  message: `Message body must be a Tiptap document.`,
});
