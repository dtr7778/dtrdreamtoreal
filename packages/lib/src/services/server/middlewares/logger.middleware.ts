import { randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";

import pino from "pino";
import { pinoHttp } from "pino-http";

import { logger, type LoggerConfig } from "../../logger";
import type { INextFunction, IRequest, IResponse } from "../types";

export type LoggerMiddlewareConfig = LoggerConfig;

export function loggerMiddleware(configs: LoggerMiddlewareConfig) {
  return function (req: IRequest, res: IResponse, next: INextFunction) {
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
    })(req, res, next);
  };
}
