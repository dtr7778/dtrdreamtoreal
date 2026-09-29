import { StatusCodes } from "http-status-codes";
import z from "zod";

import type { InputValidationError } from "@workspace/lib/types";

import { ApiError } from "../classes";
import { ParameterType } from "../constant";
import { MetadataExtractorService } from "../services/MetadataExtractor.service";
import type {
  ClassConstructor,
  INextFunction,
  IParameterMetadata,
  IRequest,
  IResponse,
} from "../types";

function serializeQuery(
  query: Record<string, unknown>
): Record<string, unknown> {
  const serialized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string") {
      if (value === "true") {
        serialized[key] = true;
      } else if (value === "false") {
        serialized[key] = false;
      } else if (value === "null") {
        serialized[key] = null;
      } else if (value === "undefined") {
        serialized[key] = undefined;
      } else if (!Number.isNaN(Number(value)) && value.trim() !== "") {
        serialized[key] = Number(value);
      } else {
        serialized[key] = value;
      }
    } else {
      serialized[key] = value;
    }
  }

  return serialized;
}

function validateWithZodSchema(
  metadata: IParameterMetadata,
  request: IRequest
): unknown {
  if (!metadata.requestSchema) {
    throw new Error("request schema is required");
  }

  const { success, error, data } = metadata.requestSchema.safeParse({
    params: { ...(request.params || {}) },
    body: { ...(request.body || {}) },
    query: serializeQuery(request.query || {}),
  });

  if (!success) {
    const validationErrors: InputValidationError[] = error.issues.map(
      (issue) => ({
        field: String(issue.path.at(-1) || "invalidPath"),
        message: issue.message,
        code: issue.code,
      })
    );

    const zodError = new z.ZodError(error.issues);

    throw new ApiError({
      statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
      message: z.prettifyError(zodError),
      cause: error,
      stack: error.stack,
      inputErrors: validationErrors,
    });
  }

  return data;
}

export function resolveParameter(
  metadata: IParameterMetadata,
  request: IRequest,
  response: IResponse,
  nextFunction: INextFunction
) {
  switch (metadata.parameterType) {
    case ParameterType.REQUEST:
      return request;

    case ParameterType.RESPONSE:
      return response;

    case ParameterType.NEXT:
      return nextFunction;

    case ParameterType.BODY:
      return request.body;

    case ParameterType.QUERY:
      return request.query;

    case ParameterType.PARAMS:
      return request.params;

    case ParameterType.PARAM:
      return metadata.propertyKey
        ? request.params[metadata.propertyKey]
        : undefined;

    case ParameterType.HEADERS:
      return request.headers;

    case ParameterType.HEADER:
      return metadata.propertyKey
        ? request.headers[metadata.propertyKey.toLowerCase()]
        : undefined;

    case ParameterType.IP:
      return request.ip || request.socket.remoteAddress;

    case ParameterType.REQUEST_VALIDATOR:
      return validateWithZodSchema(metadata, request);

    default:
      return undefined;
  }
}

export function resolveParameters(
  controllerClass: ClassConstructor,
  handlerMethodName: string,
  request: IRequest,
  response: IResponse,
  nextFunction: INextFunction
) {
  const parametersMetadata = MetadataExtractorService.extractParamsMetadata(
    controllerClass,
    handlerMethodName
  );

  // If no parameter decorators are used, return default [req, res, next]
  if (parametersMetadata.length === 0) {
    return [request, response, nextFunction];
  }

  // Sort parameters by their index to maintain correct order
  const sortedParameters = [...parametersMetadata].sort(
    (a, b) => a.parameterIndex - b.parameterIndex
  );

  // Resolve each parameter based on its type
  return sortedParameters.map((paramMetadata) => {
    return resolveParameter(paramMetadata, request, response, nextFunction);
  });
}
