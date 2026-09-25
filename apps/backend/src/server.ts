import { join } from "node:path";

import { toNodeHandler } from "better-auth/node";
import express from "express";
import type { Container } from "inversify";

import { AuthType } from "@workspace/auth";
import {
  BaseServer,
  ClassConstructor,
  LoggerInterceptor,
} from "@workspace/lib/server";
import { ExtendedRedis } from "@workspace/redis/client/ioRedis";

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
        ignoredPaths: ["/mails"],
      },
      corsConfig: {
        allowedOrigins: env.CORS_ORIGIN,
      },
      rateLimitConfig: {
        window: "10 s",
        requests: 10,
        redisClient: container.get<ExtendedRedis>(CONTAINER_TYPES.Redis),
      },
      interceptors: [LoggerInterceptor],
      beforeBodyParser: (app) => {
        app.all(
          "/api/auth/*splat",
          toNodeHandler(container.get<AuthType>(CONTAINER_TYPES.Auth))
        );
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
