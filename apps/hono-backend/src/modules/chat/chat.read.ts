type MessageOrder = { id: string; createdAt: Date };

/**
 * True when `current` comes after `target` in the room timeline, so moving the
 * read pointer to `target` would move it backward. Messages are ordered by
 * creation time, then id, matching the message list query.
 */
export function isReadAhead(current: MessageOrder, target: MessageOrder) {
  const timeDiff = current.createdAt.getTime() - target.createdAt.getTime();
  if (timeDiff !== 0) return timeDiff > 0;
  return current.id > target.id;
}
