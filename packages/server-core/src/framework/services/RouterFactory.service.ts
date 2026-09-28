import { Router } from "express";
import type { Container } from "inversify";

import type {
  ClassConstructor,
  IControllerMetadata,
  IInterceptor,
  INextFunction,
  IRequest,
  IRequestHandler,
  IResponse,
  IRouter,
} from "../types";
import { MetadataExtractorService } from "./MetadataExtractor.service";
import { MiddlewareResolverService } from "./MiddlewareResolver.service";
import { RouteHandlerFactoryService } from "./RouteHandlerFactory.service";

export class RouterFactoryService {
  /**
   * Counts dynamic segments (`:param`/`*`) in a route. Lower means more
   * specific, so it must be registered first to avoid shadowing static routes.
   */
  private static dynamicSegmentCount(routePath: string): number {
    return routePath
      .split("/")
      .filter((segment) => segment.startsWith(":") || segment === "*").length;
  }

  public static isValidExpressHandler(
    handler: unknown
  ): handler is (
    request: IRequest,
    response: IResponse,
    next: INextFunction
  ) => unknown {
    return typeof handler === "function";
  }

  public static getValidatedHandler(
    controllerInstance: unknown,
    handlerMethodName: string,
    controllerClass: ClassConstructor
  ): IRequestHandler {
    const handler = (controllerInstance as Record<string, unknown>)[
      handlerMethodName
    ];

    if (!this.isValidExpressHandler(handler)) {
      throw new Error(
        `Handler method "${handlerMethodName}" in controller "${controllerClass.name}" is not a valid Express request handler`
      );
    }

    return handler;
  }

  public static createControllerRouter(
    dependencyContainer: Container,
    controllerMetadata: IControllerMetadata,
    globalInterceptorClasses: ClassConstructor<IInterceptor>[] = []
  ): IRouter {
    const expressRouter = Router();
    const { controllerInstance, controllerDefinition, registeredRoutes } =
      controllerMetadata;

    // Register static routes before dynamic ones so `/me` is not shadowed by
    // `/:id`, regardless of declaration order.
    const orderedRoutes = [...registeredRoutes].sort(
      (a, b) =>
        this.dynamicSegmentCount(a.routePath) -
        this.dynamicSegmentCount(b.routePath)
    );

    for (const routeDefinition of orderedRoutes) {
      const originalHandler = this.getValidatedHandler(
        controllerInstance,
        routeDefinition.handlerMethodName,
        controllerDefinition.controllerClass as ClassConstructor
      );

      const routeMetadata = MetadataExtractorService.extractRouteMetadata(
        controllerDefinition.controllerClass as ClassConstructor,
        routeDefinition.handlerMethodName
      );

      const wrappedHandler =
        RouteHandlerFactoryService.createWrappedRouteHandler(
          dependencyContainer,
          controllerInstance,
          originalHandler,
          routeDefinition,
          controllerDefinition.controllerClass as ClassConstructor,
          controllerMetadata,
          routeMetadata,
          globalInterceptorClasses
        );

      const allMiddlewareClasses = [
        ...controllerMetadata.middlewareClasses,
        ...routeMetadata.middlewareClasses,
      ];

      const resolvedMiddlewareHandlers =
        MiddlewareResolverService.resolveMiddlewareHandlers(
          dependencyContainer,
          controllerDefinition.controllerClass as ClassConstructor,
          allMiddlewareClasses,
          routeDefinition
        );

      // Build middleware chain
      const middlewareChain = [...resolvedMiddlewareHandlers];

      // Register route with all middleware
      expressRouter[routeDefinition.httpMethod](
        routeDefinition.routePath,
        ...middlewareChain,
        wrappedHandler
      );
    }

    return expressRouter;
  }
}
