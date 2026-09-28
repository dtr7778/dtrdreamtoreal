import { describe, expect, it } from "vitest";

import type { PermissionType, RoleType } from "@workspace/lib/types";

import { RequirePermissions, RequireRoles } from "../decorators";
import type {
  ClassConstructor,
  IRequest,
  IRequestExecutionContext,
} from "../framework";
import { PermissionGuard } from "./permission.guard";

@RequirePermissions("system.user.list")
class TestController {
  @RequireRoles("ADMIN")
  public create(): void {}

  public list(): void {}
}

@RequirePermissions("system.user.list")
class AndController {
  @RequirePermissions("system.user.delete")
  public remove(): void {}
}

@RequirePermissions("self.user.read")
class SelfController {
  public get(): void {}
}

class OpenController {
  public ping(): void {}
}

function buildContext(
  controllerClass: ClassConstructor,
  handlerMethodName: string,
  request: Partial<IRequest>
): IRequestExecutionContext {
  return {
    request: request as IRequest,
    controllerClass,
    handlerMethodName,
  } as unknown as IRequestExecutionContext;
}

function permission(
  level: PermissionType["level"],
  resource: PermissionType["resource"],
  action: PermissionType["action"]
): PermissionType {
  return { level, resource, action } as PermissionType;
}

describe("PermissionGuard", () => {
  const guard = new PermissionGuard();

  it("allows routes without any requirement", () => {
    expect(guard.canActivate(buildContext(OpenController, "ping", {}))).toBe(
      true
    );
  });

  it("allows when the user holds a required role", () => {
    expect(
      guard.canActivate(
        buildContext(TestController, "create", {
          userRoles: [{ roleName: "ADMIN" } as RoleType],
        })
      )
    ).toBe(false);
  });

  it("allows when the user holds a required permission", () => {
    expect(
      guard.canActivate(
        buildContext(TestController, "list", {
          userPermissions: [permission("system", "user", "list")],
        })
      )
    ).toBe(true);
  });

  it("denies when the user holds neither the role nor the permission", () => {
    expect(
      guard.canActivate(
        buildContext(TestController, "create", {
          userRoles: [{ roleName: "USER" } as RoleType],
          userPermissions: [permission("system", "lead", "read")],
        })
      )
    ).toBe(false);
  });

  it("denies when roles and permissions are missing", () => {
    expect(guard.canActivate(buildContext(TestController, "list", {}))).toBe(
      false
    );
  });

  it("requires both class-level and method-level permissions", () => {
    expect(
      guard.canActivate(
        buildContext(AndController, "remove", {
          userPermissions: [permission("system", "user", "list")],
        })
      )
    ).toBe(false);

    expect(
      guard.canActivate(
        buildContext(AndController, "remove", {
          userPermissions: [
            permission("system", "user", "list"),
            permission("system", "user", "delete"),
          ],
        })
      )
    ).toBe(true);
  });

  it("denies self permissions when no resource id can be resolved", () => {
    expect(
      guard.canActivate(
        buildContext(SelfController, "get", {
          userPermissions: [permission("self", "user", "read")],
          userAuth: { user: { id: "user-1" } },
        } as never)
      )
    ).toBe(false);
  });

  it("denies self permissions for another user's resource", () => {
    expect(
      guard.canActivate(
        buildContext(SelfController, "get", {
          userPermissions: [permission("self", "user", "read")],
          userAuth: { user: { id: "user-1" } },
          params: { id: "user-2" },
        } as never)
      )
    ).toBe(false);
  });

  it("allows self permissions for the user's own resource", () => {
    expect(
      guard.canActivate(
        buildContext(SelfController, "get", {
          userPermissions: [permission("self", "user", "read")],
          userAuth: { user: { id: "user-1" } },
          params: { id: "user-1" },
        } as never)
      )
    ).toBe(true);
  });
});
