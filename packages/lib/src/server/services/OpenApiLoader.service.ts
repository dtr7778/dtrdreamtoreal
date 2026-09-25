import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import type { ClassConstructor, IApplication } from "../types";
import { MetadataExtractorService } from "./MetadataExtractor.service";
import { OpenApiDocumentationService } from "./OpenapiDocumentation.service";
import { OpenApiRegistryService } from "./OpenapiRegistry.service";

export interface IOpenApiLoaderConfigs {
  info: {
    title: string;
    version: string;
    basePath?: string;
  };
  expressApplication: IApplication;
  controllerClasses: readonly ClassConstructor[];
}

export class OpenApiLoader {
  public static loadAllControllers({
    info: { title, version, basePath = "/" },
    expressApplication,
    controllerClasses,
  }: IOpenApiLoaderConfigs) {
    const isDev = process.env.NODE_ENV === "development";

    const openApiRegistry = new OpenAPIRegistry();

    for (const controllerClass of controllerClasses) {
      const controllerMetadata =
        MetadataExtractorService.extractControllerBaseMetadata(controllerClass);

      if (!controllerMetadata) {
        if (isDev) {
          console.warn(
            `\x1b[31m[Warning]\x1b[0m Skipping ${controllerClass.name} — No metadata found.\n`
          );
        }
        continue;
      }

      OpenApiRegistryService.registerControllerRoutes(
        openApiRegistry,
        controllerMetadata,
        basePath
      );
    }

    console.log(`📚 API Documentation available at:`);
    console.log(`\t• GET ${basePath}/docs - OpenAPI JSON`);
    console.log(`\t• GET ${basePath}/reference - Scalar Reference UI\n`);

    OpenApiDocumentationService.setupDocumentationEndpoints(
      basePath,
      expressApplication,
      openApiRegistry,
      {
        title,
        version,
      }
    );
  }
}
