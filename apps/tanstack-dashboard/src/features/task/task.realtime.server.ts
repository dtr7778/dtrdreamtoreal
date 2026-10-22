import { env } from "cloudflare:workers";

import type {
  TaskRealtimeAudience,
  TaskRealtimeChange,
} from "@workspace/lib/types";

/**
 * Fans a task change out to connected sockets through the hono-backend task hub.
 * Realtime is best-effort: the write has already committed, so a publish
 * failure must not fail the mutation. Clients also refetch on their own.
 */
export async function publishTaskChange(
  audience: TaskRealtimeAudience,
  change: TaskRealtimeChange
) {
  try {
    await env.TASK.publish({ audience, change });
  } catch (error) {
    console.error("Failed to publish task change", error);
  }
}
