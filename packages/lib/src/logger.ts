import pino from "pino";
import PinoPretty from "pino-pretty";

export type LogLevel = pino.Level;

export interface LoggerConfig {
  logLevel: LogLevel;
  serviceName: string;
}

export type LoggerType = pino.Logger<never, boolean>;

export function logger(config: LoggerConfig) {
  const isDev = process.env.NODE_ENV !== "production";

  return pino(
    {
      level: config.logLevel || (isDev ? "debug" : "info"),
      base: { service: config.serviceName },
      timestamp: pino.stdTimeFunctions.isoTime,
      redact: {
        paths: [
          "req.headers.authorization",
          "req.headers.cookie",
          "req.body.password",
          "req.body.token",
          `res.headers["set-cookie"]`,
          "user.token",
        ],
        censor: "[REDACTED]",
      },
      serializers: {
        ...pino.stdSerializers,
        err: pino.stdSerializers.err,
      },
    },
    isDev
      ? PinoPretty({
          singleLine: true,
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        })
      : undefined
  );
}
