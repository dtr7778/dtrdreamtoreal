import { env } from "cloudflare:workers";

import { createDrizzleClient } from "@workspace/drizzle/client";

export function getDB() {
  return createDrizzleClient(env.DB);
}
