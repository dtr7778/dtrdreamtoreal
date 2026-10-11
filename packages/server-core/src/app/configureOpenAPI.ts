import { Scalar } from "@scalar/hono-api-reference";
import type { Schema } from "hono";

import type { AppOpenAPI } from "../types";

interface OpenApiConfig {
  version: string;
  title: string;
}

export function configureOpenAPI<
  S extends Schema,
  E extends object,
  V extends object,
>(app: AppOpenAPI<S, E, V>, config: OpenApiConfig) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      title: config.title,
      version: config.version,
    },
  });

  app.get(
    "/reference",
    Scalar({
      url: "/doc",
      theme: "kepler",
      defaultHttpClient: {
        targetKey: "js",
        clientKey: "fetch",
      },
    })
  );
}
