import type { MiddlewareHandler } from "hono";

/**
 * Preserves the tuple type of route-level middleware so that
 * `@hono/zod-openapi` can infer the context variables a middleware provides
 * (e.g. `authMiddleware` marks `user`/`session` as defined).
 */
export const routeMiddleware = <const M extends readonly MiddlewareHandler[]>(
  ...handlers: M
): [...M] => handlers as [...M];
