import { join } from "node:path";

import express from "express";
import type { Container } from "inversify";

import { ExtendedRedis } from "@workspace/lib/redis/ioRedis";
import { BaseServer, ClassConstructor } from "@workspace/lib/server";

import pkg from "../package.json";
import { CONTAINER_TYPES } from "./container/container-types";
import { env } from "./env";

export class Server extends BaseServer {
  constructor(
    container: Container,
    controllerClasses: readonly ClassConstructor[],
    cronJobClasses?: readonly ClassConstructor[]
  ) {
    super({
      container,
      title: "Backend",
      basePath: "/api/v1",
      version: pkg.version,
      csrfConfig: {
        secret: env.CSRF_TOKEN,
      },
      loggerConfig: {
        serviceName: "Backend",
        logLevel: env.API_LOG_LEVEL,
      },
      corsConfig: {
        allowedOrigins: env.CORS_ORIGIN,
      },
      rateLimitConfig: {
        window: "10 s",
        requests: 10,
        redisClient: container.get<ExtendedRedis>(CONTAINER_TYPES.Redis),
      },
      controllerClasses,
      cronJobClasses,
    });

    this.init();
  }

  init() {
    const publicPath = join(process.cwd(), "public");
    this.app.use("/public", express.static(publicPath));
  }
}
