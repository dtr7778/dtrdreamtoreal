import type { WorkerOptions } from "bullmq";
import type express from "express";
import type { BindingScope } from "inversify";
import type { ZodType } from "zod";

import type { ParameterType } from "./constant";

export type IApplication = express.Application;
export type IRequest = express.Request & {
  cspNonce?: string;
  rawBody?: string;
};
export type IResponse = express.Response;
export type INextFunction = express.NextFunction;
export type IRequestHandler = express.RequestHandler;
export type IRouter = express.Router;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClassConstructor<T = object> = new (...args: any[]) => T;

export interface IRequestExecutionContext {
  request: IRequest;
  response: IResponse;
  nextFunction: INextFunction;
  handlerMethodName: string;
  controllerClass: ClassConstructor;
}

export interface IMiddleware<TResult = unknown> {
  execute(
    executionContext: IRequestExecutionContext
  ): Promise<TResult> | TResult;
}

/**
 * Wraps the guard + handler execution for a route.
 *
 * An interceptor receives the execution context and a `next` callback that
 * runs the inner interceptors, the guards and finally the handler. It may
 * short-circuit by not calling `next`, transform the resolved value by
 * returning a different one, or observe/replace errors by wrapping `next` in
 * a `try/catch`.
 */
export interface IInterceptor<TResult = unknown> {
  intercept(
    executionContext: IRequestExecutionContext,
    next: () => Promise<unknown>
  ): Promise<TResult> | TResult;
}

export interface IGuard {
  canActivate(
    executionContext: IRequestExecutionContext
  ): Promise<boolean> | boolean;
}

export interface IExceptionFilter {
  catch(
    exception: unknown,
    context: IRequestExecutionContext
  ): void | Promise<void>;
}

export interface IRouteDefinition {
  httpMethod: "get" | "post" | "patch" | "put" | "delete";
  routePath: string;
  handlerMethodName: string;
}

export interface IControllerDefinition {
  controllerClass: NewableFunction;
  path: string;
  tags?: string[];
  securitySchemes?: Array<Record<string, string[]>>;
}

export interface ICronJobDefinition {
  cronExpression: string;
  methodName: string;
  jobName?: string;
  runOnInit?: boolean;
  timezone: string;
}

export interface IControllerMetadata {
  controllerInstance: unknown;
  controllerDefinition: IControllerDefinition;
  registeredRoutes: readonly IRouteDefinition[];
  middlewareClasses: ClassConstructor<IMiddleware>[];
  guardClasses: ClassConstructor<IGuard>[];
  interceptorClasses: ClassConstructor<IInterceptor>[];
  exceptionFilters: (ClassConstructor<IExceptionFilter> | IExceptionFilter)[];
}

export interface IRouteMetadata {
  middlewareClasses: ClassConstructor<IMiddleware>[];
  guardClasses: ClassConstructor<IGuard>[];
  interceptorClasses: ClassConstructor<IInterceptor>[];
  exceptionFilters: (ClassConstructor<IExceptionFilter> | IExceptionFilter)[];
}

export interface IParameterMetadata<TRequestSchema = ZodType> {
  parameterIndex: number;
  parameterType: ParameterType;
  propertyKey?: string | undefined;
  requestSchema?: TRequestSchema | undefined;
  extractorFunction?:
    | ((request: IRequest, response: IResponse, next: INextFunction) => unknown)
    | undefined;
}

export interface ICronJobMetadata {
  jobClass: ClassConstructor;
  jobInstance: unknown;
  cronJobs: readonly ICronJobDefinition[];
}

/** Anything with a `name` — a queue/job contract or a plain named object. */
export interface INamedEntity {
  readonly name: string;
}

/** A queue/job identifier: either a raw name or an object carrying `name`. */
export type NameOrEntity = string | INamedEntity;

/** BullMQ worker events supported by `@OnWorkerEvent`. */
export type WorkerEventName =
  | "completed"
  | "failed"
  | "error"
  | "active"
  | "stalled"
  | "progress"
  | "waiting"
  | "drained"
  | "paused"
  | "resumed"
  | "ready"
  | "closing"
  | "closed"
  | `ioredis:${string}`;

export type WorkerConfigOptions = Omit<WorkerOptions, "connection" | "prefix">;

export interface IWorkerOptions {
  /**
   * InversifyJS binding scope for the worker class.
   * @default "Singleton"
   */
  scope?: BindingScope;
  /**
   * BullMQ worker options (concurrency, limiter, autorun, ...).
   * `connection` and `prefix` are managed by the BullMQ module.
   */
  workerOptions?: WorkerConfigOptions;
}

export interface IWorkerDefinition {
  queueName: string;
  scope?: BindingScope;
  workerOptions?: WorkerConfigOptions;
}

export interface IWorkerNodeDefinition {
  methodName: string;
  /**
   * Job name handled by the method. When omitted the method is the
   * default handler for any job without a matching named handler.
   */
  jobName?: string;
}

export interface IWorkerEventDefinition {
  methodName: string;
  eventName: WorkerEventName;
}

export interface IWorkerMetadata {
  workerClass: ClassConstructor;
  workerInstance: unknown;
  definition: IWorkerDefinition;
  workerNodes: readonly IWorkerNodeDefinition[];
  workerEvents: readonly IWorkerEventDefinition[];
}
