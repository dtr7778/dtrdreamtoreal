import pino, {
  type DestinationStream,
  type Level,
  type Logger,
  type StreamEntry,
} from "pino";
import pinoPretty from "pino-pretty";

export interface LoggerConfig {
  serviceName: string;
  logLevel?: Level;
}

export type LoggerType = Logger<Level, boolean>;

export function logger(configs: LoggerConfig) {
  const isDev = process.env.NODE_ENV === "development";

  const streams: (DestinationStream | StreamEntry<Level>)[] = [];

  if (isDev) {
    const prettyStream = pinoPretty({
      singleLine: true,
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
      colorizeObjects: true,
      destination: pino.destination(1),
    });

    streams.push({ stream: prettyStream });
  }

  return pino<Level>(
    {
      level: configs.logLevel || (isDev ? "debug" : "info"),
      base: { service: configs.serviceName },
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
    pino.multistream(streams)
  );
}
