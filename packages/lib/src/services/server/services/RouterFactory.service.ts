import { Router } from "express";
import type { Container } from "inversify";

import type {
  ClassConstructor,
  IControllerMetadata,
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
    controllerMetadata: IControllerMetadata
  ): IRouter {
    const expressRouter = Router();
    const { controllerInstance, controllerDefinition, registeredRoutes } =
      controllerMetadata;

    for (const routeDefinition of registeredRoutes) {
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
          routeMetadata
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
