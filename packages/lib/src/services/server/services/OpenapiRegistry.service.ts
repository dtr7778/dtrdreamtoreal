import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import type { ContractOutputs } from "../../../types";
import { REFLECT_KEYS } from "../constant";
import type {
  IControllerDefinition,
  IControllerMetadata,
  IRouteDefinition,
} from "../types";
import { pathCombine } from "../utils/path.utils";

export class OpenApiRegistryService {
  private static registerSingleRoute(
    openApiRegistry: OpenAPIRegistry,
    controllerDefinition: IControllerDefinition,
    routeDefinition: IRouteDefinition,
    fullRoutePath: string
  ): void {
    const routeDocumentation = Reflect.getMetadata(
      REFLECT_KEYS.ROUTE_DOCS,
      controllerDefinition.controllerClass,
      routeDefinition.handlerMethodName
    ) as ContractOutputs;

    const { input, output, meta } = routeDocumentation;
    const { body, params, query } = input.shape;

    openApiRegistry.registerPath({
      method: routeDefinition.httpMethod,
      path: fullRoutePath,
      tags: controllerDefinition?.tags,
      summary: meta?.summary,
      description: meta?.description,
      operationId:
        meta?.operationId ||
        `${controllerDefinition.controllerClass.name}_${routeDefinition.handlerMethodName}`,
      request: {
        ...(query && {
          query,
        }),
        ...(params && {
          params,
        }),
        ...(body && {
          body: {
            content: {
              "application/json": {
                schema: body,
              },
            },
          },
        }),
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: output,
            },
          },
        },
      },
    });
  }

  public static registerControllerRoutes(
    openApiRegistry: OpenAPIRegistry,
    controllerMetadata: Pick<
      IControllerMetadata,
      "controllerDefinition" | "registeredRoutes"
    >,
    basePath: string
  ): void {
    const { controllerDefinition, registeredRoutes } = controllerMetadata;

    for (const routeDefinition of registeredRoutes) {
      const fullRoutePath = pathCombine(
        basePath,
        controllerDefinition.path,
        routeDefinition.routePath
      );

      this.registerSingleRoute(
        openApiRegistry,
        controllerDefinition,
        routeDefinition,
        fullRoutePath
      );
    }
  }
}
