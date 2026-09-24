import { Container } from "inversify";
import { describe, expect, it, vi } from "vitest";

import type { IInterceptor, IRequestExecutionContext } from "../types";
import { InterceptorExecutorService } from "./InterceptorExecutor.service";

const context = {} as IRequestExecutionContext;

class A implements IInterceptor {
  constructor(private readonly log: string[]) {}

  public async intercept(
    _executionContext: IRequestExecutionContext,
    next: () => Promise<unknown>
  ): Promise<unknown> {
    this.log.push("A:before");
    const result = await next();
    this.log.push("A:after");
    return result;
  }
}

class B implements IInterceptor {
  constructor(private readonly log: string[]) {}

  public async intercept(
    _executionContext: IRequestExecutionContext,
    next: () => Promise<unknown>
  ): Promise<unknown> {
    this.log.push("B:before");
    const result = await next();
    this.log.push("B:after");
    return result;
  }
}

class ShortCircuit implements IInterceptor {
  public intercept(): string {
    return "short-circuited";
  }
}

class Wrapper implements IInterceptor {
  public async intercept(
    _executionContext: IRequestExecutionContext,
    next: () => Promise<unknown>
  ): Promise<unknown> {
    return `wrapped:${await next()}`;
  }
}

describe("InterceptorExecutorService", () => {
  it("runs interceptors outermost-first around the handler", async () => {
    const log: string[] = [];
    const container = new Container();
    container.bind(A).toConstantValue(new A(log));
    container.bind(B).toConstantValue(new B(log));

    const handler = vi.fn(async () => {
      log.push("handler");
      return "result";
    });

    const result = await InterceptorExecutorService.execute(
      container,
      [A, B],
      context,
      handler
    );

    expect(result).toBe("result");
    expect(log).toEqual([
      "A:before",
      "B:before",
      "handler",
      "B:after",
      "A:after",
    ]);
  });

  it("returns the handler result when no interceptors are registered", async () => {
    const container = new Container();

    const result = await InterceptorExecutorService.execute(
      container,
      [],
      context,
      async () => "plain"
    );

    expect(result).toBe("plain");
  });

  it("lets an interceptor transform the resolved value", async () => {
    const container = new Container();
    container.bind(Wrapper).toConstantValue(new Wrapper());

    const result = await InterceptorExecutorService.execute(
      container,
      [Wrapper],
      context,
      async () => "value"
    );

    expect(result).toBe("wrapped:value");
  });

  it("short-circuits without invoking the handler when next is not called", async () => {
    const container = new Container();
    container.bind(ShortCircuit).toConstantValue(new ShortCircuit());

    const handler = vi.fn(async () => "handler");

    const result = await InterceptorExecutorService.execute(
      container,
      [ShortCircuit],
      context,
      handler
    );

    expect(result).toBe("short-circuited");
    expect(handler).not.toHaveBeenCalled();
  });
});
