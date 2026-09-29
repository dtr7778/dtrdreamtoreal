import { ORPCInstrumentation } from "@orpc/otel";
import * as Sentry from "@sentry/nextjs";

import {
  appTag,
  isSentryEnabled,
  resolveDataCollection,
  resolveEnvironment,
  resolveRelease,
  resolveTracesSampleRate,
  scrubEvent,
} from "@workspace/sentry/config";

const dsn = process.env.SENTRY_DSN;

class SentryORPCInstrumentation extends ORPCInstrumentation {
  public readonly name: string = "ORPCInstrumentation";
}

if (isSentryEnabled(dsn)) {
  Sentry.init({
    dsn,
    environment: resolveEnvironment(),
    release: resolveRelease(),
    tracesSampleRate: resolveTracesSampleRate(),
    dataCollection: resolveDataCollection(),
    initialScope: { tags: appTag("web") },
    beforeSend: scrubEvent,
    integrations: [new SentryORPCInstrumentation()],
  });
}
