const KEY_PREFIX = "uploads";
const MAX_SCOPE_LENGTH = 64;
const MAX_FILENAME_LENGTH = 120;

function sanitizeSegment(
  value: string,
  fallback: string,
  maxLength: number
): string {
  const sanitized = value
    .normalize("NFKD")
    .replace(/[^\w.\- ]+/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[._]+/, "")
    .slice(0, maxLength);

  return sanitized || fallback;
}

/** Drops any path segments and unsafe characters from a user supplied filename. */
export function sanitizeFilename(filename: string): string {
  const base = filename.split(/[\\/]/).pop() ?? filename;
  return sanitizeSegment(base, "file", MAX_FILENAME_LENGTH) || "file";
}

export function sanitizeScope(scope: string): string {
  return sanitizeSegment(scope, "general", MAX_SCOPE_LENGTH);
}

/**
 * Builds a collision-resistant, user-namespaced object key:
 * `uploads/{scope}/{userId}/{timestamp}-{uuid}-{filename}`.
 */
export function buildObjectKey({
  scope,
  userId,
  filename,
}: {
  scope: string;
  userId: string;
  filename: string;
}): string {
  const unique = `${Date.now()}-${crypto.randomUUID()}`;
  return `${KEY_PREFIX}/${sanitizeScope(scope)}/${userId}/${unique}-${sanitizeFilename(filename)}`;
}

/** Verifies a key was produced for the given user via {@link buildObjectKey}. */
export function isKeyOwnedByUser(key: string, userId: string): boolean {
  const parts = key.split("/");
  return parts.length >= 4 && parts[0] === KEY_PREFIX && parts[2] === userId;
}
