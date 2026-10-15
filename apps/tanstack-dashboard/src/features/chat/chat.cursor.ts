/**
 * Where a message page window is anchored. `before` loads older history,
 * `after` (with `inclusive`) starts a window at a known message, and
 * `fromOldest` starts at the first message of the room. `anchor` tags the
 * initial window so the UI can find the read position; it is never sent to the API.
 */
export type MessageCursorType = {
  before?: string;
  after?: string;
  inclusive?: boolean;
  fromOldest?: boolean;
  anchor?: boolean;
};

/**
 * Initial window for a room: starts at the last read message (inclusive) so
 * the first unseen message directly follows it. A room that was never read
 * starts at its oldest message.
 */
export function unreadAnchorCursor(
  lastReadMessageId: string | null
): MessageCursorType {
  if (lastReadMessageId) {
    return { after: lastReadMessageId, inclusive: true, anchor: true };
  }
  return { fromOldest: true, anchor: true };
}
