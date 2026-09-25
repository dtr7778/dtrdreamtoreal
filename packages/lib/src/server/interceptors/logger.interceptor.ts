import { randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";

import pino from "pino";
import { pinoHttp } from "pino-http";

import { logger, type LoggerConfig } from "../../logger";
import type { IInterceptor, IRequestExecutionContext } from "../types";

export type LoggerInterceptorConfig = LoggerConfig;

function createHttpLogger(configs: LoggerInterceptorConfig) {
  return pinoHttp({
    logger: logger(configs),

    genReqId: (req: IncomingMessage, res) => {
      const header = (req.headers["x-request-id"] ||
        req.headers["x-correlation-id"]) as string | undefined;

      const id = header || randomUUID();
      res.setHeader("x-request-id", id);
      return id;
    },

    autoLogging: {
      ignore: (req) => req.url === "/health" || req.method === "OPTIONS",
    },

    customProps: (req, res) => ({
      service: configs.serviceName,
      reqId: req.id,
      remoteAddress: req.socket?.remoteAddress,
      path: (req as unknown as { originalUrl?: string })?.originalUrl,
      method: req.method,
      userAgent: req.headers?.["user-agent"],
      statusCode: res.statusCode,
      userId: (req as { user?: { id?: string } }).user?.id,
    }),

    customAttributeKeys: {
      req: "req",
      res: "res",
      err: "err",
      responseTime: "responseTime",
    },

    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },

    customSuccessMessage: (req, res, responseTime) =>
      `${req.method} ${(req as unknown as { originalUrl?: string })?.originalUrl} ${res.statusCode} - ${responseTime} ms`,

    customErrorMessage: (req, res, err) =>
      `${req.method} ${(req as unknown as { originalUrl?: string })?.originalUrl} ${res.statusCode || 500} - error: ${err.message}`,

    serializers: {
      req: (req) => ({
        query: req.query,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
        contentLength: res.getHeader && res.getHeader("content-length"),
      }),
      err: pino.stdSerializers.err,
    },
  });
}

/**
 * Logs every controller request using `pino-http`.
 *
 * Registered as a global interceptor by {@link BaseServer}; it wraps the rest
 * of the pipeline so status/error-aware logging, request ids and response
 * timing behave exactly as the previous logger middleware did.
 */
export class LoggerInterceptor implements IInterceptor {
  private readonly httpLogger: ReturnType<typeof createHttpLogger>;

  constructor(configs: LoggerInterceptorConfig) {
    this.httpLogger = createHttpLogger(configs);
  }

  public async intercept(
    { request, response }: IRequestExecutionContext,
    next: () => Promise<unknown>
  ): Promise<unknown> {
    // pino-http attaches its response listeners and then calls its own `next`;
    // this interceptor's `next` runs the inner pipeline. Logging still fires on
    // the response `finish` event, preserving the middleware's behavior.
    this.httpLogger(request, response, () => {});

    return next();
  }
}
