import type { Container } from "inversify";

import type {
  ClassConstructor,
  IApplication,
  IInterceptor,
  IRouteDefinition,
} from "../types";
import { pathNormalize } from "../utils/path.utils";
import { MetadataExtractorService } from "./MetadataExtractor.service";
import { RouterFactoryService } from "./RouterFactory.service";

interface RouteInfos extends IRouteDefinition {
  methodColor: string;
}

interface ControllerInfos {
  controllerName: string;
  basePath: string;
  routeInfos: RouteInfos[];
}

export interface IControllerLoaderConfiguration {
  info: {
    basePath?: string;
  };
  expressApplication: IApplication;
  dependencyContainer: Container;
  controllerClasses: readonly ClassConstructor[];
  globalInterceptors?: readonly ClassConstructor<IInterceptor>[];
}

export class ControllerLoader {
  public static loadAllControllers({
    expressApplication,
    dependencyContainer,
    controllerClasses,
    globalInterceptors = [],
    info: { basePath = "/" },
  }: IControllerLoaderConfiguration): void {
    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
      console.log(
        "\n\x1b[36m========== Controller Loading Started ==========\x1b[0m\n"
      );
    }

    const controllerInfos: ControllerInfos[] = [];

    for (const controllerClass of controllerClasses) {
      const controllerMetadata =
        MetadataExtractorService.extractControllerMetadata(
          dependencyContainer,
          controllerClass
        );

      if (!controllerMetadata) {
        if (isDev) {
          console.warn(
            `\x1b[31m[Warning]\x1b[0m Skipping ${controllerClass.name} — No metadata found.\n`
          );
        }
        continue;
      }

      const controllerRouter = RouterFactoryService.createControllerRouter(
        dependencyContainer,
        controllerMetadata,
        [...globalInterceptors]
      );

      const fullControllerPath = pathNormalize(
        `${basePath}${controllerMetadata.controllerDefinition.path}`
      );

      expressApplication.use(fullControllerPath, controllerRouter);

      if (isDev) {
        const routeInfos: RouteInfos[] = [];

        for (const route of controllerMetadata.registeredRoutes) {
          const methodColor = this.getMethodColor(route.httpMethod);
          routeInfos.push({ ...route, methodColor });
        }

        controllerInfos.push({
          controllerName: controllerClass.name,
          basePath: fullControllerPath,
          routeInfos,
        });
      }
    }

    if (isDev) {
      let totalRoutesCount = 0;

      controllerInfos.forEach(({ controllerName, basePath, routeInfos }) => {
        console.log(`${controllerName}:`);
        routeInfos.forEach(
          ({ methodColor, httpMethod, handlerMethodName, routePath }) => {
            totalRoutesCount++;
            console.log(
              `\t${methodColor}${httpMethod.toUpperCase()}\x1b[0m  ${basePath}${routePath}  →  ${handlerMethodName}()`
            );
          }
        );
      });

      console.log(`\nRoutes registered: \x1b[35m${totalRoutesCount}\x1b[0m\n`);
      console.log(
        "\n\x1b[36m========== Controller Loading Completed ==========\x1b[0m\n"
      );
    }
  }

  private static getMethodColor(method: string): string {
    const colors: Record<string, string> = {
      get: "\x1b[32m",
      post: "\x1b[33m",
      put: "\x1b[34m",
      patch: "\x1b[35m",
      delete: "\x1b[31m",
    };
    return colors[method.toLowerCase()] || "\x1b[37m";
  }
}
