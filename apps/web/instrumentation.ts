import * as Sentry from "@sentry/nextjs";

export async function register() {
  console.log("Initialized 'DTR - Dream To Real' app");

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
    await import("./server/orpc.server-client");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
