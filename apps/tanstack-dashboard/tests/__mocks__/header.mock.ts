export function createMockHeaders(
  overrides: Record<string, string> = {}
): Readonly<Headers> {
  return new Headers({
    "content-type": "application/json",
    "x-forwarded-for": "127.0.0.1",
    cookie: "",
    ...overrides,
  });
}
