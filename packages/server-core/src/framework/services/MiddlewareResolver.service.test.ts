import { Container } from "inversify";
import { describe, expect, it, vi } from "vitest";

import type {
  ClassConstructor,
  IMiddleware,
  IRouteDefinition,
} from "../types";
import { MiddlewareResolverService } from "./MiddlewareResolver.service";

const controllerClass = class {} as ClassConstructor;
const routeDefinition = {
  handlerMethodName: "handler",
} as IRouteDefinition;

describe("MiddlewareResolverService", () => {
  it("calls next after a middleware completes successfully", async () => {
    class PassingMiddleware implements IMiddleware {
      public async execute(): Promise<void> {}
    }

    const container = new Container();
    container.bind(PassingMiddleware).toSelf();

    const next = vi.fn();

    const handler = MiddlewareResolverService.createMiddlewareHandler(
      container,
      controllerClass,
      PassingMiddleware,
      routeDefinition
    );

    await handler({} as never, {} as never, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("forwards a middleware error to next", async () => {
    const error = new Error("boom");

    class FailingMiddleware implements IMiddleware {
      public async execute(): Promise<void> {
        throw error;
      }
    }

    const container = new Container();
    container.bind(FailingMiddleware).toSelf();

    const next = vi.fn();

    const handler = MiddlewareResolverService.createMiddlewareHandler(
      container,
      controllerClass,
      FailingMiddleware,
      routeDefinition
    );

    await handler({} as never, {} as never, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  });
});