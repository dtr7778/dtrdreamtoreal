import type { NameOrEntity } from "../types";

/**
 * Resolves a queue/job identifier to its string name.
 * Accepts a plain string or any object carrying a `name` (e.g. a contract).
 */
export function resolveName(input: NameOrEntity): string {
  return typeof input === "string" ? input : input.name;
}