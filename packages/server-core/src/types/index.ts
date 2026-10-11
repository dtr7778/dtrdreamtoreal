import type {
  OpenAPIHono,
  RouteConfig,
  RouteHandler,
  z,
} from "@hono/zod-openapi";
import type { Schema } from "hono";
import type { PinoLogger } from "hono-pino";

export interface AppVariables {
  logger: PinoLogger;
}

export type AppBindings<E extends object, V extends object> = {
  Bindings: E;
  Variables: AppVariables & V;
};

export type AppOpenAPI<
  S extends Schema,
  E extends object,
  V extends object,
> = OpenAPIHono<AppBindings<E, V>, S>;

export type AppRouteHandler<
  R extends RouteConfig,
  E extends object,
  V extends object,
> = RouteHandler<R, AppBindings<E, V>>;

export type ZodSchema = z.ZodUnion | z.ZodObject | z.ZodArray<z.ZodObject>;
export type ZodIssue = z.core.$ZodIssue;
