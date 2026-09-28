import http from "node:http";

import express from "express";
import { StatusCodes } from "http-status-codes";
import type { Container } from "inversify";

import {
  createRatelimit,
  type IoRedisRatelimitConfig,
} from "@workspace/lib/rate-limit/ioredis";

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
import { ControllerLoader } from "./services/ControllerLoader.service";
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
  version: string;
  basePath?: string;
  corsConfig: CorsConfig;
  csrfConfig: CsrfConfig;
  rateLimitConfig: IoRedisRatelimitConfig;
  interceptors?: readonly ClassConstructor<IInterceptor>[];
  beforeBodyParser?: (app: IApplication) => void;
  /**
   * Express `trust proxy` setting. Defaults to `TRUST_PROXY` env (parsed as a
   * number/boolean), falling back to `1` (single reverse proxy).
   */
  trustProxy?: number | boolean | string;
  /**
   * Mount the OpenAPI JSON (`/docs`) and Scalar reference (`/reference`)
   * endpoints. Defaults to enabled outside production.
   */
  enableOpenApiDocs?: boolean;
}

function resolveTrustProxy(
  configured: BaseServerConfig["trustProxy"]
): number | boolean | string {
  if (configured !== undefined) return configured;

  const raw = process.env.TRUST_PROXY;
  if (raw === undefined || raw === "") return 1;
  if (raw === "true") return true;
  if (raw === "false") return false;

  const asNumber = Number(raw);
  return Number.isNaN(asNumber) ? raw : asNumber;
}

export abstract class BaseServer implements IBaseServer {
  protected readonly app: IApplication;
  private server?: http.Server;

  constructor(config: BaseServerConfig) {
    this.app = express();

    this.app.set("trust proxy", resolveTrustProxy(config.trustProxy));

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

    const rateLimit = createRatelimit(config.rateLimitConfig);
    this.app.use(rateLimitMiddleware(rateLimit));

    // Registered after the rate limiter so token minting cannot be hammered.
    this.app.get(`${config.basePath}/csrf-token`, (req, res) => {
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

    this.init();

    const enableOpenApiDocs =
      config.enableOpenApiDocs ?? process.env.NODE_ENV !== "production";

    if (enableOpenApiDocs) {
      OpenApiLoader.loadAllControllers({
        info: {
          title: config.title,
          version: config.version,
          basePath: config.basePath,
        },
        expressApplication: this.app,
        controllerClasses: config.controllerClasses,
      });
    }

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
