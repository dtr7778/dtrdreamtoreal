import { describe, expect, it } from "vitest";

import type {
  ClassConstructor,
  IRequest,
  IRequestExecutionContext,
} from "@workspace/lib/server";
import type { PermissionType, RoleType } from "@workspace/lib/types";

import {
  RequirePermissions,
  RequireRoles,
} from "@/decorators/permission.decorator";

import { PermissionGuard } from "./permission.guard";

@RequirePermissions("system.user.list")
class TestController {
  @RequireRoles("ADMIN")
  public create(): void {}

  public list(): void {}
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
    ).toBe(true);
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
});