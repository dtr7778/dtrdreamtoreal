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

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (isSentryEnabled(dsn)) {
  Sentry.init({
    dsn,
    environment: resolveEnvironment(),
    release: resolveRelease(),
    tracesSampleRate: resolveTracesSampleRate(),
    dataCollection: resolveDataCollection(),
    integrations: [
      Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
    ],
    initialScope: { tags: appTag("web") },
    beforeSend: scrubEvent,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
