import http from "node:http";

import express from "express";
import { StatusCodes } from "http-status-codes";
import type { Container } from "inversify";

import type { LoggerConfig } from "../logger";
import {
  UpstashRatelimit,
  UpstashRatelimitConfig,
} from "../rate-limit/upstashRateLimit.service";
import { ApiResponse } from "./classes";
import { API_MESSAGE } from "./constant";
import { createCsrf, type CsrfConfig } from "./createCsrf";
import {
  cookieParserMiddleware,
  CorsConfig,
  corsMiddleware,
  errorMiddleware,
  jsonMiddleware,
  loggerMiddleware,
  nonceMiddleware,
  notFoundHandler,
  urlEncoderMiddleware,
} from "./middlewares";
import { helmetMiddleware } from "./middlewares/helmet.middleware";
import { rateLimitMiddleware } from "./middlewares/rateLimit.middleware";
import { ControllerLoader } from "./services";
import { OpenApiLoader } from "./services/OpenApiLoader.service";
import type {
  ClassConstructor,
  IApplication,
  IRequest,
  IResponse,
} from "./types";
import { apiResponse } from "./utils";

export interface IBaseServer {
  getApp(): IApplication;
  listen(port: number, hostName?: string): void;
}

export interface BaseServerConfig {
  title: string;
  container: Container;
  controllerClasses: readonly ClassConstructor[];
  version: string;
  basePath?: string;
  corsConfig: CorsConfig;
  csrfConfig: CsrfConfig;
  rateLimitConfig: UpstashRatelimitConfig;
  loggerConfig: LoggerConfig;
}

export abstract class BaseServer implements IBaseServer {
  protected readonly app: IApplication;

  constructor(config: BaseServerConfig) {
    this.app = express();

    this.app.set("trust proxy", 1);

    this.app.get("/health", (_req: IRequest, res: IResponse) => {
      apiResponse(res)(
        new ApiResponse({
          statusCode: StatusCodes.OK,
          message: API_MESSAGE.HEALTH,
          data: null,
        })
      );
    });

    this.app.use(nonceMiddleware());
    this.app.use(helmetMiddleware());
    this.app.use(corsMiddleware(config.corsConfig));
    this.app.use(cookieParserMiddleware);

    const { generateToken, middleware, CsrfTokenError } = createCsrf(
      config.csrfConfig
    );
    this.app.get("/csrf-token", (req, res) => {
      apiResponse(res)(
        new ApiResponse({
          statusCode: StatusCodes.OK,
          message: API_MESSAGE.GET_CSRF_TOKEN,
          data: generateToken(req, res),
        })
      );
    });
    this.app.use(middleware);

    const rateLimit = new UpstashRatelimit(config.rateLimitConfig);
    this.app.use(rateLimitMiddleware(rateLimit));

    this.app.use(loggerMiddleware(config.loggerConfig));

    this.app.use(jsonMiddleware());
    this.app.use(urlEncoderMiddleware());

    ControllerLoader.loadAllControllers({
      info: { basePath: config.basePath },
      expressApplication: this.app,
      dependencyContainer: config.container,
      controllerClasses: config.controllerClasses,
    });

    this.init();

    OpenApiLoader.loadAllControllers({
      info: {
        title: config.title,
        version: config.version,
        basePath: config.basePath,
      },
      expressApplication: this.app,
      controllerClasses: config.controllerClasses,
    });

    this.app.use(notFoundHandler);
    this.app.use(errorMiddleware(CsrfTokenError));
  }

  protected abstract init(): void;

  public getApp(): IApplication {
    return this.app;
  }

  public listen(port: number, hostName: string = "0.0.0.0") {
    const server = http.createServer(this.app);

    server.listen(port, hostName, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  }
}
