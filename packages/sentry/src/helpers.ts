import { captureException, withScope } from "@sentry/core";

import type { SentryApp } from "./config";

export interface CaptureContext {
  app?: SentryApp;
  tags?: Record<string, string>;
  user?: { id?: string };
  contexts?: Record<string, Record<string, unknown>>;
}

export function captureWithContext(
  error: unknown,
  context: CaptureContext = {}
): void {
  withScope((scope) => {
    if (context.app) scope.setTag("app", context.app);
    if (context.tags) scope.setTags(context.tags);
    if (context.user?.id) scope.setUser({ id: context.user.id });
    for (const [key, value] of Object.entries(context.contexts ?? {})) {
      scope.setContext(key, value);
    }
    captureException(error);
  });
}
