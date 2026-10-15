import { Fragment } from "react";
import type { Key, ReactNode } from "react";

import type {
  TiptapDoc,
  TiptapMark,
  TiptapNode,
} from "@workspace/drizzle/schemas";
import { cn } from "@workspace/ui/lib/utils";

function applyMarks(
  text: string,
  marks: Array<TiptapMark> | undefined
): ReactNode {
  let tree: ReactNode = text;

  for (const mark of marks ?? []) {
    switch (mark.type) {
      case "bold":
        tree = <strong>{tree}</strong>;
        break;
      case "italic":
        tree = <em>{tree}</em>;
        break;
      case "strike":
        tree = <s>{tree}</s>;
        break;
      case "underline":
        tree = <u>{tree}</u>;
        break;
      case "code":
        tree = <code>{tree}</code>;
        break;
      case "link": {
        const href = mark.attrs?.href;
        if (typeof href === "string") {
          tree = (
            <a href={href} target="_blank" rel="noopener noreferrer nofollow">
              {tree}
            </a>
          );
        }
        break;
      }
      default:
        break;
    }
  }

  return tree;
}

function renderChildren(node: TiptapNode): ReactNode {
  return (node.content ?? []).map((child, index) => renderNode(child, index));
}

function renderNode(node: TiptapNode, key: Key): ReactNode {
  switch (node.type) {
    case "text":
      return (
        <Fragment key={key}>{applyMarks(node.text ?? "", node.marks)}</Fragment>
      );
    case "mention": {
      const label = node.attrs?.label;
      return (
        <span key={key} className="chat-mention">
          {typeof label === "string" ? `@${label}` : ""}
        </span>
      );
    }
    case "hardBreak":
      return <br key={key} />;
    case "paragraph":
      return <p key={key}>{renderChildren(node)}</p>;
    case "heading":
      return <p key={key}>{renderChildren(node)}</p>;
    case "blockquote":
      return <blockquote key={key}>{renderChildren(node)}</blockquote>;
    case "codeBlock":
      return (
        <pre key={key}>
          <code>{node.content?.map((child) => child.text ?? "").join("")}</code>
        </pre>
      );
    case "bulletList":
      return <ul key={key}>{renderChildren(node)}</ul>;
    case "orderedList":
      return <ol key={key}>{renderChildren(node)}</ol>;
    case "listItem":
      return <li key={key}>{renderChildren(node)}</li>;
    default:
      return null;
  }
}

/**
 * Render a stored Tiptap document by walking its known node and mark types into
 * React elements. Unknown nodes are ignored, and text is escaped by React, so
 * no sanitization layer is required.
 */
export function MessageBody({
  doc,
  className,
}: {
  doc: TiptapDoc | null | undefined;
  className?: string;
}) {
  if (!doc?.content?.length) return null;

  return (
    <div className={cn("chat-message-body whitespace-pre-wrap", className)}>
      {renderChildren(doc)}
    </div>
  );
}
