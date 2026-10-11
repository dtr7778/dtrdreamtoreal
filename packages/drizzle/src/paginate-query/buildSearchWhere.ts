import { ilike, or, type SQL } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

/**
 * Build a `where` condition for full-text search across columns.
 */
export function buildSearchWhere(
  search: string | null | undefined,
  fields: SQLiteColumn[]
): SQL | undefined {
  if (!search || !fields.length) return undefined;

  const conditions = fields.map((col) => ilike(col, `%${search}%`));

  if (conditions.length === 0) return undefined;

  return conditions.length === 1 ? conditions[0] : or(...conditions);
}
