import { describe, expect, it } from "vitest";

import type { ChatMemberType } from "@workspace/lib/chat";

import { buildMentionItems, EVERYONE_MENTION_ID } from "./chat.mentions";

function member(
  userId: string,
  name: string,
  image: string | null = null
): ChatMemberType {
  return {
    userId,
    name,
    image,
    role: "member",
    isMuted: false,
    lastReadAt: null,
    lastReadMessageId: null,
  };
}

describe("buildMentionItems", () => {
  it("excludes the current user", () => {
    const items = buildMentionItems(
      [member("me", "Me"), member("u2", "Jane")],
      "me"
    );
    expect(items.map((item) => item.id)).not.toContain("me");
    expect(items.map((item) => item.id)).toContain("u2");
  });

  it("always includes the @everyone entry", () => {
    const items = buildMentionItems([member("u2", "Jane")], "me");
    expect(items[0]).toEqual({
      id: EVERYONE_MENTION_ID,
      label: "everyone",
      image: null,
    });
  });

  it("sorts members by name", () => {
    const items = buildMentionItems(
      [member("u3", "Zoe"), member("u2", "Jane")],
      "me"
    );
    expect(items.slice(1).map((item) => item.label)).toEqual(["Jane", "Zoe"]);
  });
});
