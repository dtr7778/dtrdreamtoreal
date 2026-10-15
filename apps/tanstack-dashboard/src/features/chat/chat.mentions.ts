import type { ChatMemberType } from "@workspace/lib/chat";

export const EVERYONE_MENTION_ID = "everyone";

export type MentionItem = {
  id: string;
  label: string;
  image?: string | null;
};

/**
 * Build the list of mentionable entries for a room: every member except the
 * current user, plus the room-wide `@everyone` entry.
 */
export function buildMentionItems(
  members: Array<ChatMemberType>,
  currentUserId?: string | null
): Array<MentionItem> {
  const people = members
    .filter((member) => member.userId !== currentUserId)
    .map((member) => ({
      id: member.userId,
      label: member.name,
      image: member.image,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return [
    { id: EVERYONE_MENTION_ID, label: "everyone", image: null },
    ...people,
  ];
}
