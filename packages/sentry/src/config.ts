import type {
  DataCollection,
  ErrorEvent,
  LogSeverityLevel,
} from "@sentry/core";

export type SentryApp = "web" | "backend" | "worker";

const REDACTED = "[REDACTED]";

const SENSITIVE_HEADERS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "proxy-authorization",
]);

export function isSentryEnabled(
  dsn: string | undefined = process.env.SENTRY_DSN
): boolean {
  if (process.env.SENTRY_DISABLED === "true") return false;
  return typeof dsn === "string" && dsn.trim() !== "";
}

export function resolveEnvironment(): string {
  return (
    process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? "development"
  );
}

export function resolveRelease(): string | undefined {
  return process.env.SENTRY_RELEASE || undefined;
}

export function resolveTracesSampleRate(
  nodeEnv: string | undefined = process.env.NODE_ENV
): number {
  const raw = process.env.SENTRY_TRACES_SAMPLE_RATE;
  if (raw !== undefined && raw.trim() !== "") {
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) return parsed;
  }

  if (nodeEnv === "production") return 0.1;
  if (nodeEnv === "test") return 0;
  return 1;
}

export function resolveLogLevels(
  nodeEnv: string | undefined = process.env.NODE_ENV
): LogSeverityLevel[] {
  if (nodeEnv === "production") return ["warn", "error", "fatal"];
  return ["debug", "info", "warn", "error", "fatal"];
}

export function appTag(app: SentryApp): Record<string, string> {
  return { app };
}

export function resolveDataCollection(): DataCollection {
  return {
    userInfo: false,
    cookies: false,
    httpHeaders: { request: false, response: false },
    httpBodies: [],
    urlQueryParams: false,
    graphQL: { document: false, variables: false },
    genAI: { inputs: false, outputs: false },
    databaseQueryData: false,
    queues: false,
    stackFrameVariables: false,
  };
}

export function scrubEvent(event: ErrorEvent): ErrorEvent | null {
  const hasException = Boolean(event.exception?.values?.length);
  const hasMessage =
    typeof event.message === "string" && event.message.trim() !== "";

  if (!hasException && !hasMessage) return null;

  if (event.request) {
    delete event.request.data;
    delete event.request.cookies;

    if (event.request.headers) {
      for (const key of Object.keys(event.request.headers)) {
        if (SENSITIVE_HEADERS.has(key.toLowerCase())) {
          event.request.headers[key] = REDACTED;
        }
      }
    }
  }

  return event;
}
