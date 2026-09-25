import http from "node:http";

import express from "express";
import { StatusCodes } from "http-status-codes";
import type { Container } from "inversify";

import {
  IoRedisRatelimit,
  type IoRedisRatelimitConfig,
} from "../rate-limit/IoRedisRateLimit.service";
import { ApiResponse } from "./classes";
import { API_MESSAGE } from "./constant";
import { createCsrf } from "./csrf/createCsrf";
import type { CsrfConfig } from "./csrf/csrf";
import {
  cookieParserMiddleware,
  CorsConfig,
  corsMiddleware,
  csrfErrorMiddleware,
  errorMiddleware,
  jsonMiddleware,
  nonceMiddleware,
  notFoundHandler,
  urlEncoderMiddleware,
} from "./middlewares";
import { helmetMiddleware } from "./middlewares/helmet.middleware";
import { rateLimitMiddleware } from "./middlewares/rateLimit.middleware";
import { ControllerLoader } from "./services";
import { CronJobService } from "./services/CronJob.service";
import { OpenApiLoader } from "./services/OpenApiLoader.service";
import type {
  ClassConstructor,
  IApplication,
  IInterceptor,
  IRequest,
  IResponse,
} from "./types";
import { sendApiResponse } from "./utils";

export interface IBaseServer {
  getApp(): IApplication;
  listen(port: number, hostName?: string): void;
}

export interface BaseServerConfig {
  title: string;
  container: Container;
  controllerClasses: readonly ClassConstructor[];
  cronJobClasses?: readonly ClassConstructor[];
  version: string;
  basePath?: string;
  corsConfig: CorsConfig;
  csrfConfig: CsrfConfig;
  rateLimitConfig: IoRedisRatelimitConfig;
  interceptors?: readonly ClassConstructor<IInterceptor>[];
  beforeBodyParser?: (app: IApplication) => void;
}

export abstract class BaseServer implements IBaseServer {
  protected readonly app: IApplication;
  private server?: http.Server;

  constructor(config: BaseServerConfig) {
    this.app = express();

    this.app.set("trust proxy", 1);

    this.app.get("/health", (_req: IRequest, res: IResponse) => {
      sendApiResponse(res)(
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

    const { generateToken, setCsrfCookie, middleware } = createCsrf({
      ...config.csrfConfig,
      basePath: config.basePath,
    });

    this.app.get("/csrf-token", (req, res) => {
      const token = generateToken(req);
      setCsrfCookie(res, token);
      sendApiResponse(res)(
        new ApiResponse({
          statusCode: StatusCodes.OK,
          message: API_MESSAGE.GET_CSRF_TOKEN,
          data: token,
        })
      );
    });

    const rateLimit = new IoRedisRatelimit(config.rateLimitConfig);
    this.app.use(rateLimitMiddleware(rateLimit));

    config.beforeBodyParser?.(this.app);

    this.app.use(jsonMiddleware());
    this.app.use(middleware);
    this.app.use(urlEncoderMiddleware());

    const globalInterceptors = [...(config.interceptors ?? [])];

    ControllerLoader.loadAllControllers({
      info: { basePath: config.basePath },
      expressApplication: this.app,
      dependencyContainer: config.container,
      controllerClasses: config.controllerClasses,
      globalInterceptors,
    });

    if (config?.cronJobClasses) {
      const cronScheduler = new CronJobService(config.container);
      cronScheduler.loadAllJobs(config.cronJobClasses);
    }

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
    this.app.use(csrfErrorMiddleware);
    this.app.use(errorMiddleware);
  }

  protected abstract init(): void;

  public getApp(): IApplication {
    return this.app;
  }

  public listen(port: number, hostName: string = "0.0.0.0") {
    this.server = http.createServer(this.app);

    this.server.listen(port, hostName, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  }
}
