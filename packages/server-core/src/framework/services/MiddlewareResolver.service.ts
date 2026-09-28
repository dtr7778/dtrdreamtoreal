import type { Container } from "inversify";

import type {
  ClassConstructor,
  IMiddleware,
  INextFunction,
  IRequest,
  IRequestExecutionContext,
  IRequestHandler,
  IResponse,
  IRouteDefinition,
} from "../types";

export class MiddlewareResolverService {
  public static createMiddlewareHandler(
    dependencyContainer: Container,
    controllerClass: ClassConstructor,
    middlewareClass: ClassConstructor<IMiddleware>,
    routeDefinition: IRouteDefinition
  ): IRequestHandler {
    return async (
      request: IRequest,
      response: IResponse,
      nextFunction: INextFunction
    ): Promise<void> => {
      const executionContext: IRequestExecutionContext = {
        request,
        response,
        nextFunction,
        handlerMethodName: routeDefinition.handlerMethodName,
        controllerClass: controllerClass,
      };

      try {
        const middlewareInstance =
          dependencyContainer.get<IMiddleware>(middlewareClass);
        await middlewareInstance.execute(executionContext);
        nextFunction();
      } catch (error) {
        nextFunction(error);
      }
    };
  }

  public static resolveMiddlewareHandlers(
    dependencyContainer: Container,
    controllerClass: ClassConstructor,
    middlewareClasses: ClassConstructor<IMiddleware>[],
    routeDefinition: IRouteDefinition
  ): IRequestHandler[] {
    return middlewareClasses.map((middlewareClass) =>
      this.createMiddlewareHandler(
        dependencyContainer,
        controllerClass,
        middlewareClass,
        routeDefinition
      )
    );
  }
}
