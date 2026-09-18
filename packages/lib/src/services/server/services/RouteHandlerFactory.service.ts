import type { Container } from "inversify";

import { ApiResponse } from "../classes";
import { ParameterType, REFLECT_KEYS } from "../constant";
import type {
  ClassConstructor,
  IControllerMetadata,
  INextFunction,
  IParameterMetadata,
  IRequest,
  IRequestExecutionContext,
  IRequestHandler,
  IResponse,
  IRouteDefinition,
  IRouteMetadata,
} from "../types";
import { resolveParameters } from "../utils/parameter.utils";
import { ExceptionHandlerService } from "./ExceptionHandler.service";
import { GuardExecutorService } from "./GuardExecutor.service";

export class RouteHandlerFactoryService {
  private static hasResponseDecorator(
    controllerClass: ClassConstructor,
    handlerMethodName: string
  ): boolean {
    const parametersMetadata =
      (Reflect.getMetadata(
        REFLECT_KEYS.PARAMS,
        controllerClass,
        handlerMethodName
      ) as IParameterMetadata[]) || [];

    return parametersMetadata.some(
      (param) => param.parameterType === ParameterType.RESPONSE
    );
  }

  private static isApiResponseInstance<T>(obj: unknown): obj is ApiResponse<T> {
    return obj instanceof ApiResponse;
  }

  public static createWrappedRouteHandler(
    dependencyContainer: Container,
    controllerInstance: unknown,
    originalHandler: IRequestHandler,
    routeDefinition: IRouteDefinition,
    controllerClass: ClassConstructor,
    controllerMetadata: IControllerMetadata,
    routeMetadata: IRouteMetadata
  ): IRequestHandler {
    const allGuardClasses = [
      ...controllerMetadata.guardClasses,
      ...routeMetadata.guardClasses,
    ];

    const allExceptionFilters = [
      ...controllerMetadata.exceptionFilters,
      ...routeMetadata.exceptionFilters,
    ];

    const hasResponseParam = this.hasResponseDecorator(
      controllerClass,
      routeDefinition.handlerMethodName
    );

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
        controllerClass,
      };

      try {
        if (allGuardClasses.length > 0) {
          const areGuardsPassed = await GuardExecutorService.executeAllGuards(
            dependencyContainer,
            allGuardClasses,
            executionContext
          );

          if (!areGuardsPassed) {
            GuardExecutorService.sendForbiddenResponse(response);
            return;
          }
        }

        const resolvedParameters = resolveParameters(
          controllerClass,
          routeDefinition.handlerMethodName,
          request,
          response,
          nextFunction
        ) as Parameters<IRequestHandler>;

        const result = await originalHandler.call(
          controllerInstance,
          ...resolvedParameters
        );

        // If method uses @Response decorator, user handles response
        if (hasResponseParam) {
          return;
        }

        // Auto-send result if method returns value
        if (result !== undefined && result !== null && !response.headersSent) {
          // Check if result is an ApiResponse instance
          if (this.isApiResponseInstance(result)) {
            response.status(result.statusCode).json({
              statusCode: result.statusCode,
              success:
                result.success !== undefined
                  ? result.success
                  : result.statusCode >= 200 && result.statusCode < 400,
              message: result.message,
              data: result.data,
            });
            return;
          }

          // Default: send raw result
          if (typeof result === "object" && !Buffer.isBuffer(result)) {
            response.json(result);
          } else {
            response.send(result);
          }
        }
      } catch (thrownException) {
        await ExceptionHandlerService.handleException(
          thrownException,
          allExceptionFilters,
          executionContext,
          nextFunction,
          dependencyContainer
        );
      }
    };
  }
}
