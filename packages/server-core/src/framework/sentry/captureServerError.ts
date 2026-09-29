import { captureWithContext } from "@workspace/sentry/helpers";

export interface ServerErrorContext {
  requestId?: string;
  userId?: string;
  method?: string;
  route?: string;
}

export function captureServerError(
  error: unknown,
  context: ServerErrorContext
): void {
  captureWithContext(error, {
    app: "backend",
    tags: {
      app: "backend",
      ...(context.method ? { method: context.method } : {}),
      ...(context.route ? { route: context.route } : {}),
    },
    ...(context.userId ? { user: { id: context.userId } } : {}),
    ...(context.requestId
      ? { contexts: { request: { id: context.requestId } } }
      : {}),
  });
}
