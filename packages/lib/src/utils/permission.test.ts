import { describe, expect, it } from "vitest";

import type { PermissionType } from "../types";
import { hasPermission } from "./permission";

function permission(
  level: PermissionType["level"],
  resource: PermissionType["resource"],
  action: PermissionType["action"]
): PermissionType {
  return { level, resource, action };
}

describe("hasPermission", () => {
  it("allows when nothing is required", () => {
    expect(hasPermission([], [], {})).toBe(true);
  });

  it("denies when the user has no permissions", () => {
    expect(hasPermission([], [permission("system", "user", "read")], {})).toBe(
      false
    );
  });

  it("allows an exact permission match", () => {
    expect(
      hasPermission(
        [permission("system", "user", "read")],
        [permission("system", "user", "read")],
        {}
      )
    ).toBe(true);
  });

  it("denies an unrelated permission", () => {
    expect(
      hasPermission(
        [permission("system", "user", "read")],
        [permission("system", "user", "delete")],
        {}
      )
    ).toBe(false);
  });

  it("treats the manage action as a wildcard", () => {
    expect(
      hasPermission(
        [permission("system", "user", "manage")],
        [
          permission("system", "user", "delete"),
          permission("system", "user", "update"),
        ],
        {}
      )
    ).toBe(true);
  });

  it("allows when at least one of several permissions matches", () => {
    expect(
      hasPermission(
        [permission("system", "lead", "read")],
        [
          permission("system", "user", "read"),
          permission("system", "lead", "read"),
        ],
        {}
      )
    ).toBe(true);
  });

  it("denies self-level permissions for another user's resource", () => {
    expect(
      hasPermission(
        [permission("self", "user", "read")],
        [permission("self", "user", "read")],
        { userId: "user-1", resourceId: "user-2" }
      )
    ).toBe(false);
  });

  it("allows self-level permissions for the user's own resource", () => {
    expect(
      hasPermission(
        [permission("self", "user", "read")],
        [permission("self", "user", "read")],
        { userId: "user-1", resourceId: "user-1" }
      )
    ).toBe(true);
  });
});
