import type { MiddlewareHandler } from "hono";
import type { PermissionStrType } from "@workspace/lib/types";
import type { ApiBindings, AuthenticatedBindings } from "@/types";
export declare const authMiddleware: MiddlewareHandler<AuthenticatedBindings>;
export declare const permissionMiddleware: (requiredPermissions: PermissionStrType[]) => MiddlewareHandler<ApiBindings>;
//# sourceMappingURL=auth.middleware.d.ts.map