import { describe, expect, it } from "vitest";

import type { PermissionStrType, PermissionType } from "../../src/types";
import { hasPermission } from "../../src/utils/permission";

function permission(
  level: PermissionType["level"],
  resource: PermissionType["resource"],
  action: PermissionType["action"]
): PermissionType {
  return {
    name: `${level}.${resource}.${action}` as PermissionStrType,
    level,
    resource,
    action,
  };
}

describe("hasPermission", () => {
  it("allows when nothing is required", () => {
    expect(hasPermission([], [], {})).toBe(true);
  });

  it("denies when the user has no permissions", () => {
    expect(hasPermission([], ["system.user.read"], {})).toBe(false);
  });

  it("allows an exact permission match", () => {
    expect(
      hasPermission([permission("system", "user", "read")], ["system.user.read"], {})
    ).toBe(true);
  });

  it("denies an unrelated permission", () => {
    expect(
      hasPermission([permission("system", "user", "read")], ["system.user.delete"], {})
    ).toBe(false);
  });

  it("treats the manage action as a wildcard", () => {
    expect(
      hasPermission(
        [permission("system", "user", "manage")],
        ["system.user.delete", "system.user.update"],
        {}
      )
    ).toBe(true);
  });

  it("allows when at least one of several permissions matches", () => {
    expect(
      hasPermission(
        [permission("system", "lead", "read")],
        ["system.user.read", "system.lead.read"],
        {}
      )
    ).toBe(true);
  });

  it("denies self-level permissions for another user's resource", () => {
    expect(
      hasPermission([permission("self", "user", "read")], ["self.user.read"], {
        userId: "user-1",
        resourceId: "user-2",
      })
    ).toBe(false);
  });

  it("allows self-level permissions for the user's own resource", () => {
    expect(
      hasPermission([permission("self", "user", "read")], ["self.user.read"], {
        userId: "user-1",
        resourceId: "user-1",
      })
    ).toBe(true);
  });
});