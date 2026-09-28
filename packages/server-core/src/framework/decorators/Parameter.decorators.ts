import type { ZodType } from "zod";

import { ParameterType, REFLECT_KEYS } from "../constant";
import type {
  INextFunction,
  IParameterMetadata,
  IRequest,
  IResponse,
} from "../types";

export function createParameterDecorator(
  parameterType: ParameterType,
  propertyKey?: string,
  extractorFunction?: (
    request: IRequest,
    response: IResponse,
    next: INextFunction
  ) => unknown,
  requestSchema?: ZodType
): ParameterDecorator {
  return function (
    target: object,
    methodKey: string | symbol | undefined,
    parameterIndex: number
  ) {
    const metadataTarget = methodKey ? target.constructor : target;
    const methodKeyStr = methodKey ? String(methodKey) : "__constructor__";

    const existingParameters: IParameterMetadata[] =
      Reflect.getOwnMetadata(
        REFLECT_KEYS.PARAMS,
        metadataTarget,
        methodKeyStr
      ) || [];

    const parameterMetadata: IParameterMetadata = {
      parameterIndex,
      parameterType,
      propertyKey,
      extractorFunction,
      requestSchema,
    };

    Reflect.defineMetadata(
      REFLECT_KEYS.PARAMS,
      [...existingParameters, parameterMetadata],
      metadataTarget,
      methodKeyStr
    );
  };
}

/**
 * Injects the Express Request object
 * @example
 * public async handler(@Request() req: Request) {}
 */
export function Request(): ParameterDecorator {
  return createParameterDecorator(ParameterType.REQUEST);
}

/**
 * Injects the Express Response object
 * @example
 * public async handler(@Response() res: Response) { res.json({data: 'test'}); }
 */
export function Response(): ParameterDecorator {
  return createParameterDecorator(ParameterType.RESPONSE);
}

/**
 * Injects the Express NextFunction
 * @example
 * public async handler(@Next() next: NextFunction) {}
 */
export function Next(): ParameterDecorator {
  return createParameterDecorator(ParameterType.NEXT);
}

/**
 * Injects the request body (req.body)
 * @example
 * public async createUser(@Body() body: CreateUserDto) {}
 */
export function Body(): ParameterDecorator {
  return createParameterDecorator(ParameterType.BODY);
}

/**
 * Injects the query parameters (req.query)
 * @example
 * public async getUsers(@Query() query: { page: number; limit: number }) {}
 */
export function Query(): ParameterDecorator {
  return createParameterDecorator(ParameterType.QUERY);
}

/**
 * Injects all route parameters (req.params)
 * @example
 * public async getUser(@Params() params: { id: string }) {}
 */
export function Params(): ParameterDecorator {
  return createParameterDecorator(ParameterType.PARAMS);
}

/**
 * Injects a specific route parameter
 * @param key - The parameter name
 * @example
 * public async getUser(@Param('id') userId: string) {}
 */
export function Param(key: string): ParameterDecorator {
  return createParameterDecorator(ParameterType.PARAM, key);
}

/**
 * Injects all request headers (req.headers)
 * @example
 * public async handler(@Headers() headers: Record<string, string>) {}
 */
export function Headers(): ParameterDecorator {
  return createParameterDecorator(ParameterType.HEADERS);
}

/**
 * Injects a specific header value
 * @param key - The header name (case-insensitive)
 * @example
 * public async handler(@Header('authorization') token: string) {}
 */
export function Header(key: string): ParameterDecorator {
  return createParameterDecorator(ParameterType.HEADER, key);
}

/**
 * Injects the client IP address
 * @example
 * public async handler(@Ip() clientIp: string) {}
 */
export function Ip(): ParameterDecorator {
  return createParameterDecorator(ParameterType.IP);
}
