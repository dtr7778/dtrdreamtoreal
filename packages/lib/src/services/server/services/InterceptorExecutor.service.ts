import type { Container } from "inversify";

import type {
  ClassConstructor,
  IInterceptor,
  IRequestExecutionContext,
} from "../types";

export class InterceptorExecutorService {
  /**
   * Compose and run the interceptor chain around `handler`.
   *
   * `interceptorClasses[0]` is the outermost interceptor. Each interceptor is
   * resolved from the container per request (matching guards), and every
   * `next()` invocation runs the next interceptor, then the guards and finally
   * the handler.
   *
   * @returns the value produced by the outermost interceptor. When no
   * interceptors are registered, the handler's result is returned unchanged.
   */
  public static async execute(
    dependencyContainer: Container,
    interceptorClasses: ClassConstructor<IInterceptor>[],
    executionContext: IRequestExecutionContext,
    handler: () => Promise<unknown>
  ): Promise<unknown> {
    let next = handler;

    for (let index = interceptorClasses.length - 1; index >= 0; index--) {
      const interceptorClass = interceptorClasses[index];

      if (!interceptorClass) {
        continue;
      }

      const inner = next;

      next = async () => {
        const interceptor =
          dependencyContainer.get<IInterceptor>(interceptorClass);

        return interceptor.intercept(executionContext, inner);
      };
    }

    return next();
  }
}
