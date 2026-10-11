import { describe, expect, it } from "vitest";

import {
  buildObjectKey,
  isKeyOwnedByUser,
  sanitizeFilename,
  sanitizeScope,
} from "./r2.keys";

describe("sanitizeFilename", () => {
  it("strips path traversal segments", () => {
    expect(sanitizeFilename("../../etc/passwd")).toBe("passwd");
  });

  it("replaces unsafe characters", () => {
    expect(sanitizeFilename("my report (final).pdf")).toBe(
      "my_report_final_.pdf"
    );
  });

  it("falls back when nothing is left", () => {
    expect(sanitizeFilename("...")).toBe("file");
  });
});

describe("sanitizeScope", () => {
  it("falls back to general for empty input", () => {
    expect(sanitizeScope("///")).toBe("general");
  });
});

describe("buildObjectKey", () => {
  it("namespaces by prefix, scope and user", () => {
    const key = buildObjectKey({
      scope: "profile_image",
      userId: "user-1",
      filename: "avatar.png",
    });

    expect(key.startsWith("uploads/profile_image/user-1/")).toBe(true);
    expect(key.endsWith("avatar.png")).toBe(true);
  });

  it("does not leak path separators from the filename", () => {
    const key = buildObjectKey({
      scope: "profile_image",
      userId: "user-1",
      filename: "../../secret.png",
    });

    const segments = key.split("/");
    expect(segments).toHaveLength(4);
    expect(segments[3]?.endsWith("secret.png")).toBe(true);
  });
});

describe("isKeyOwnedByUser", () => {
  const key = buildObjectKey({
    scope: "profile_image",
    userId: "user-1",
    filename: "avatar.png",
  });

  it("returns true for the owning user", () => {
    expect(isKeyOwnedByUser(key, "user-1")).toBe(true);
  });

  it("returns false for another user", () => {
    expect(isKeyOwnedByUser(key, "user-2")).toBe(false);
  });

  it("returns false for foreign keys", () => {
    expect(isKeyOwnedByUser("other/user-1/file.png", "user-1")).toBe(false);
  });
});
