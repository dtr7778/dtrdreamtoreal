import type { ContractOutputs } from "../../../types";
import { REFLECT_KEYS } from "../constant";
import type { IRouteDefinition } from "../types";
import { pathNormalize } from "../utils/path.utils";

function createHttpMethodDecorator(
  httpMethod: "get" | "post" | "put" | "patch" | "delete"
) {
  return function (
    path: string,
    contract: Omit<ContractOutputs, "method" | "path">
  ): MethodDecorator {
    return function (target: object, propertyKey: string | symbol) {
      const controllerClass = target.constructor;

      const existingRoutes: IRouteDefinition[] =
        Reflect.getMetadata(REFLECT_KEYS.ROUTE, controllerClass) || [];

      existingRoutes.push({
        httpMethod,
        routePath: pathNormalize(path),
        handlerMethodName: propertyKey as string,
      });

      Reflect.defineMetadata(
        REFLECT_KEYS.ROUTE,
        existingRoutes,
        controllerClass
      );

      Reflect.defineMetadata(
        REFLECT_KEYS.ROUTE_DOCS,
        contract,
        controllerClass,
        propertyKey
      );
    };
  };
}

export const Get = createHttpMethodDecorator("get");
export const Post = createHttpMethodDecorator("post");
export const Put = createHttpMethodDecorator("put");
export const Patch = createHttpMethodDecorator("patch");
export const Delete = createHttpMethodDecorator("delete");
