import { ORPCInstrumentation } from "@orpc/otel";
import * as Sentry from "@sentry/nextjs";

import {
  appTag,
  isSentryEnabled,
  isSpotlightEnabled,
  resolveDataCollection,
  resolveEnvironment,
  resolveRelease,
  resolveSpotlight,
  resolveTracesSampleRate,
  scrubEvent,
} from "@workspace/sentry/config";

const dsn = process.env.SENTRY_DSN;

class SentryORPCInstrumentation extends ORPCInstrumentation {
  public readonly name: string = "ORPCInstrumentation";
}

if (isSentryEnabled(dsn) || isSpotlightEnabled()) {
  Sentry.init({
    dsn,
    spotlight: resolveSpotlight(),
    environment: resolveEnvironment(),
    release: resolveRelease(),
    tracesSampleRate: resolveTracesSampleRate(),
    dataCollection: resolveDataCollection(),
    initialScope: { tags: appTag("web") },
    beforeSend: scrubEvent,
    integrations: [new SentryORPCInstrumentation()],
  });
}
