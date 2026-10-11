import { pinoLogger } from "hono-pino";

import { logger, type LoggerConfig } from "@workspace/lib/logger";

export function loggerMiddleware(config: LoggerConfig) {
  return pinoLogger({
    pino: logger(config),
  });
}
