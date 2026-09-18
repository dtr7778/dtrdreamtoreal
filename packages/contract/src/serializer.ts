export function serializeFilterObject(
  obj: Record<string, unknown>
): string | undefined {
  const entries = Object.entries(obj).filter(
    ([, value]) => value !== undefined
  );
  if (entries.length === 0) return undefined;
  return entries.map(([key, value]) => `${key}:${String(value)}`).join(",");
}

export function serializeArrayToString(value: unknown): string | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  return value.join(",");
}

export function serializeQuery(
  query: Record<string, unknown>
): Record<string, unknown> {
  if (!query || typeof query !== "object") return query;

  const serialized = { ...query };

  if (serialized.filter && typeof serialized.filter === "object") {
    serialized.filter = serializeFilterObject(
      serialized.filter as Record<string, unknown>
    );
  }

  if (Array.isArray(serialized.searchFields)) {
    serialized.searchFields = serializeArrayToString(serialized.searchFields);
  }

  if (Array.isArray(serialized.orderField)) {
    serialized.orderField = serializeArrayToString(serialized.orderField);
  }

  return serialized;
}

export function serializePath(path: string, params?: unknown): string {
  let resolvedPath = path;

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        resolvedPath = resolvedPath.replace(
          `:${key}`,
          encodeURIComponent(String(value))
        );
      }
    }
  }
  return resolvedPath;
}
