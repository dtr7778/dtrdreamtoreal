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

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const spotlightValue = process.env.NEXT_PUBLIC_SENTRY_SPOTLIGHT;

if (isSentryEnabled(dsn) || isSpotlightEnabled(spotlightValue)) {
  Sentry.init({
    dsn,
    spotlight: resolveSpotlight(spotlightValue),
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
