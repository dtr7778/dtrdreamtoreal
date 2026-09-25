import {
  OpenApiGeneratorV3,
  type OpenAPIRegistry,
} from "@asteasolutions/zod-to-openapi";
import { apiReference } from "@scalar/express-api-reference";
import { StatusCodes } from "http-status-codes";

import { IApplication } from "../types";
import { pathNormalize } from "../utils/path.utils";

export class OpenApiDocumentationService {
  public static setupDocumentationEndpoints(
    basePath: string,
    expressApp: IApplication,
    openApiRegistry: OpenAPIRegistry,
    apiInfo: { title: string; version: string }
  ): void {
    const openApiDocumentGenerator = new OpenApiGeneratorV3(
      openApiRegistry.definitions
    );

    const generatedOpenApiDocument = openApiDocumentGenerator.generateDocument({
      openapi: "3.0.0",
      info: apiInfo,
    });

    expressApp.get(pathNormalize(`${basePath}/docs`), (_request, response) =>
      response.status(StatusCodes.OK).json(generatedOpenApiDocument)
    );

    expressApp.use(
      pathNormalize(`${basePath}/reference`),
      apiReference({
        theme: "kepler",
        layout: "modern",
        favicon: "/public/favicon.ico",
        defaultHttpClient: {
          targetKey: "node",
          clientKey: "fetch",
        },
        darkMode: true,
        content: generatedOpenApiDocument,
      })
    );
  }
}
