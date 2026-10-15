import { describe, expect, it } from "vitest";

import type { ChatMessageItemType } from "@workspace/lib/chat";

import { unreadAnchorCursor } from "./chat.cursor";
import { getUnreadLayout } from "./chat.unread";

function message(id: string, createdAt: string): ChatMessageItemType {
  return { id, createdAt: new Date(createdAt) } as ChatMessageItemType;
}

describe("unreadAnchorCursor", () => {
  it("starts an inclusive window at the last read message", () => {
    expect(unreadAnchorCursor("m1")).toEqual({
      after: "m1",
      inclusive: true,
      anchor: true,
    });
  });

  it("starts at the oldest message when the room was never read", () => {
    expect(unreadAnchorCursor(null)).toEqual({
      fromOldest: true,
      anchor: true,
    });
  });
});

describe("getUnreadLayout", () => {
  const boundary = message("read", "2026-10-01T10:00:00Z");
  const firstUnseen = message("unseen-1", "2026-10-01T10:05:00Z");
  const second = message("unseen-2", "2026-10-01T10:06:00Z");

  it("places the divider before the first unseen message", () => {
    const layout = getUnreadLayout(
      {
        pages: [{ items: [boundary, firstUnseen, second] }],
        pageParams: [unreadAnchorCursor("read")],
      },
      "read"
    );

    expect(layout).toEqual({
      openAt: "divider",
      unreadDividerId: "unseen-1",
      readBoundaryAt: boundary.createdAt,
    });
  });

  it("opens at the bottom when the read message is the latest", () => {
    const layout = getUnreadLayout(
      {
        pages: [{ items: [boundary] }],
        pageParams: [unreadAnchorCursor("read")],
      },
      "read"
    );

    expect(layout.openAt).toBe("bottom");
    expect(layout.unreadDividerId).toBeNull();
  });

  it("opens at the top when the room was never read", () => {
    const layout = getUnreadLayout(
      {
        pages: [{ items: [firstUnseen, second] }],
        pageParams: [unreadAnchorCursor(null)],
      },
      null
    );

    expect(layout).toEqual({
      openAt: "top",
      unreadDividerId: null,
      readBoundaryAt: null,
    });
  });

  it("uses the anchored page even after older pages were prepended", () => {
    const older = message("older", "2026-09-30T10:00:00Z");
    const layout = getUnreadLayout(
      {
        pages: [{ items: [older] }, { items: [boundary, firstUnseen] }],
        pageParams: [{ before: "read" }, unreadAnchorCursor("read")],
      },
      "read"
    );

    expect(layout.unreadDividerId).toBe("unseen-1");
  });

  it("opens at the bottom when there is no anchored window", () => {
    const layout = getUnreadLayout(
      { pages: [{ items: [second] }], pageParams: [null] },
      "read"
    );

    expect(layout).toEqual({
      openAt: "bottom",
      unreadDividerId: null,
      readBoundaryAt: null,
    });
  });
});
