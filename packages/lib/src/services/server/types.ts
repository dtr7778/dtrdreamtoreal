import type express from "express";
import type { ZodType } from "zod";

import type { ParameterType } from "./constant";

export type IApplication = express.Application;
export type IRequest = express.Request & { cspNonce?: string };
export type IResponse = express.Response;
export type INextFunction = express.NextFunction;
export type IRequestHandler = express.RequestHandler;
export type IRouter = express.Router;

export interface InputValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiResponseType<T = unknown> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
  error?: unknown;
  stack?: string;
  inputErrors?: InputValidationError[];
}

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
  exceptionFilters: (ClassConstructor<IExceptionFilter> | IExceptionFilter)[];
}

export interface IRouteMetadata {
  middlewareClasses: ClassConstructor<IMiddleware>[];
  guardClasses: ClassConstructor<IGuard>[];
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
