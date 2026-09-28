import type { Container } from "inversify";

import { REFLECT_KEYS } from "../constant";
import type {
  ClassConstructor,
  IControllerDefinition,
  IControllerMetadata,
  ICronJobDefinition,
  ICronJobMetadata,
  IParameterMetadata,
  IRouteDefinition,
  IRouteMetadata,
  IWorkerDefinition,
  IWorkerEventDefinition,
  IWorkerMetadata,
  IWorkerNodeDefinition,
} from "../types";

export class MetadataExtractorService {
  public static extractControllerBaseMetadata(
    controllerClass: ClassConstructor
  ): {
    controllerDefinition: IControllerDefinition;
    registeredRoutes: readonly IRouteDefinition[];
  } | null {
    const controllerDefinition = Reflect.getMetadata(
      REFLECT_KEYS.CONTROLLER,
      controllerClass
    ) as IControllerDefinition | undefined;

    if (!controllerDefinition) {
      return null;
    }

    const registeredRoutes = Reflect.getMetadata(
      REFLECT_KEYS.ROUTE,
      controllerClass
    ) as readonly IRouteDefinition[] | undefined;

    if (!registeredRoutes || registeredRoutes.length === 0) {
      return null;
    }

    return { controllerDefinition, registeredRoutes };
  }

  public static extractControllerMetadata(
    dependencyContainer: Container,
    controllerClass: ClassConstructor
  ): IControllerMetadata | null {
    const baseMetadata = this.extractControllerBaseMetadata(controllerClass);

    if (!baseMetadata) {
      return null;
    }

    const { controllerDefinition, registeredRoutes } = baseMetadata;

    return {
      controllerInstance: dependencyContainer.get(controllerClass),
      controllerDefinition,
      registeredRoutes,
      middlewareClasses:
        Reflect.getMetadata(REFLECT_KEYS.MIDDLEWARE, controllerClass) || [],
      guardClasses:
        Reflect.getMetadata(REFLECT_KEYS.GUARD, controllerClass) || [],
      interceptorClasses:
        Reflect.getMetadata(REFLECT_KEYS.INTERCEPTOR, controllerClass) || [],
      exceptionFilters:
        Reflect.getMetadata(REFLECT_KEYS.FILTER, controllerClass) || [],
    };
  }

  public static extractParamsMetadata(
    controllerClass: ClassConstructor,
    handlerMethodName: string
  ): IParameterMetadata[] {
    return (
      (Reflect.getMetadata(
        REFLECT_KEYS.PARAMS,
        controllerClass,
        handlerMethodName
      ) as IParameterMetadata[]) || []
    );
  }

  public static extractRouteMetadata(
    controllerClass: ClassConstructor,
    handlerMethodName: string
  ): IRouteMetadata {
    return {
      middlewareClasses:
        Reflect.getMetadata(
          REFLECT_KEYS.MIDDLEWARE,
          controllerClass,
          handlerMethodName
        ) || [],
      guardClasses:
        Reflect.getMetadata(
          REFLECT_KEYS.GUARD,
          controllerClass,
          handlerMethodName
        ) || [],
      interceptorClasses:
        Reflect.getMetadata(
          REFLECT_KEYS.INTERCEPTOR,
          controllerClass,
          handlerMethodName
        ) || [],
      exceptionFilters:
        Reflect.getMetadata(
          REFLECT_KEYS.FILTER,
          controllerClass,
          handlerMethodName
        ) || [],
    };
  }

  public static extractCronJobMetadata(
    dependencyContainer: Container,
    cronJobClass: ClassConstructor
  ): ICronJobMetadata | null {
    const isJobClass = Reflect.getMetadata(
      REFLECT_KEYS.CRON_JOB_CLASS,
      cronJobClass
    );

    if (!isJobClass) {
      return null;
    }

    const cronJobs = Reflect.getMetadata(
      REFLECT_KEYS.CRON_JOB_METHOD,
      cronJobClass
    ) as readonly ICronJobDefinition[] | undefined;

    if (!cronJobs || cronJobs.length === 0) {
      return null;
    }

    return {
      jobClass: cronJobClass,
      jobInstance: dependencyContainer.get(cronJobClass),
      cronJobs,
    };
  }

  public static extractWorkerMetadata(
    dependencyContainer: Container,
    workerClass: ClassConstructor
  ): IWorkerMetadata | null {
    const definition = Reflect.getMetadata(
      REFLECT_KEYS.BULLMQ_WORKER,
      workerClass
    ) as IWorkerDefinition | undefined;

    if (!definition) {
      return null;
    }

    // Auto-register the worker so it can be resolved from the container
    // without requiring an explicit binding.
    if (!dependencyContainer.isBound(workerClass)) {
      const binding = dependencyContainer.bind(workerClass).to(workerClass);

      switch (definition.scope) {
        case "Transient":
          binding.inTransientScope();
          break;
        case "Request":
          binding.inRequestScope();
          break;
        default:
          binding.inSingletonScope();
      }
    }

    const workerNodes =
      (Reflect.getMetadata(REFLECT_KEYS.BULLMQ_WORKER_NODE, workerClass) as
        | IWorkerNodeDefinition[]
        | undefined) ?? [];

    const workerEvents =
      (Reflect.getMetadata(REFLECT_KEYS.BULLMQ_WORKER_EVENT, workerClass) as
        | IWorkerEventDefinition[]
        | undefined) ?? [];

    return {
      workerClass,
      workerInstance: dependencyContainer.get(workerClass),
      definition,
      workerNodes,
      workerEvents,
    };
  }
}
