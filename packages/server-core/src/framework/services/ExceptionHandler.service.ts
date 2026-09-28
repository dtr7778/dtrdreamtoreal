import type { Container } from "inversify";

import type {
  ClassConstructor,
  IExceptionFilter,
  INextFunction,
  IRequestExecutionContext,
} from "../types";

export class ExceptionHandlerService {
  private static async executeExceptionFilters(
    thrownException: unknown,
    exceptionFilters: (ClassConstructor<IExceptionFilter> | IExceptionFilter)[],
    executionContext: IRequestExecutionContext,
    dependencyContainer?: Container
  ): Promise<void> {
    for (const filter of exceptionFilters) {
      const filterInstance =
        typeof filter === "function"
          ? (dependencyContainer?.get(filter) ?? new filter())
          : filter;
      await filterInstance.catch(thrownException, executionContext);
    }
  }

  public static async handleException(
    thrownException: unknown,
    exceptionFilters: (ClassConstructor<IExceptionFilter> | IExceptionFilter)[],
    executionContext: IRequestExecutionContext,
    nextFunction: INextFunction,
    dependencyContainer?: Container
  ): Promise<void> {
    if (exceptionFilters.length === 0) {
      nextFunction(thrownException);
      return;
    }

    try {
      await this.executeExceptionFilters(
        thrownException,
        exceptionFilters,
        executionContext,
        dependencyContainer
      );
    } catch (filterError) {
      // A filter threw. Forward the original failure once unless a response
      // was already produced, in which case there is nothing left to send.
      if (!executionContext.response.headersSent) {
        nextFunction(filterError);
      }
    }
  }
}
