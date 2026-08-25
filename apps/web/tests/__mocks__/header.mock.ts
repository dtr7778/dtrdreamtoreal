import type { NextRequest } from "next/server";

export function createMockHeaders(
  overrides: Record<string, string> = {}
): Readonly<NextRequest["headers"]> {
  return new Headers({
    "content-type": "application/json",
    "x-forwarded-for": "127.0.0.1",
    cookie: "",
    ...overrides,
  }) as unknown as Readonly<NextRequest["headers"]>;
}
