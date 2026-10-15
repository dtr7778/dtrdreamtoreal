import { describe, expect, it } from "vitest";

import { isReadAhead } from "./chat.read";

const earlier = new Date("2026-10-01T10:00:00Z");
const later = new Date("2026-10-01T10:05:00Z");

describe("isReadAhead", () => {
  it("is true when the current pointer is newer than the target", () => {
    expect(
      isReadAhead(
        { id: "b", createdAt: later },
        { id: "a", createdAt: earlier }
      )
    ).toBe(true);
  });

  it("is false when the target is newer, so the pointer can advance", () => {
    expect(
      isReadAhead(
        { id: "a", createdAt: earlier },
        { id: "b", createdAt: later }
      )
    ).toBe(false);
  });

  it("breaks timestamp ties by id, matching the message order", () => {
    expect(
      isReadAhead(
        { id: "m2", createdAt: earlier },
        { id: "m1", createdAt: earlier }
      )
    ).toBe(true);
    expect(
      isReadAhead(
        { id: "m1", createdAt: earlier },
        { id: "m2", createdAt: earlier }
      )
    ).toBe(false);
  });

  it("is false when the pointer is the same message", () => {
    expect(
      isReadAhead(
        { id: "m1", createdAt: earlier },
        { id: "m1", createdAt: earlier }
      )
    ).toBe(false);
  });
});
