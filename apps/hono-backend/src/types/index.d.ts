import type { RouteConfig, RouteConfigToEnv, RouteHandler } from "@hono/zod-openapi";
import type { Schema } from "hono";
import type { AuthSession, AuthUser } from "@workspace/auth";
import type { AppBindings, AppOpenAPI } from "@workspace/server-core";
export interface ApiVariables {
    user: AuthUser | undefined;
    session: AuthSession | undefined;
}
export interface AuthVariables {
    user: AuthUser;
    session: AuthSession;
}
export type ApiBindings = AppBindings<Env, ApiVariables>;
export type AuthenticatedBindings = AppBindings<Env, AuthVariables>;
export type ApiOpenAPI<S extends Schema = {}> = AppOpenAPI<S, Env, ApiVariables>;
/**
 * Handler whose context includes the variables provided by the route's
 * route-level middleware. Routes using `authMiddleware` therefore see
 * `user`/`session` as defined, while other routes see them as possibly
 * `undefined`.
 */
export type ApiRouteHandler<R extends RouteConfig> = RouteHandler<R, RouteConfigToEnv<R> & ApiBindings>;
//# sourceMappingURL=index.d.ts.map