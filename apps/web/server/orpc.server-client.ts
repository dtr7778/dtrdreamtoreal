import "server-only";

import { headers } from "next/headers";

import { createRouterClient } from "@orpc/server";

import { db } from "@/lib/db";
import { redisClient } from "@/lib/redis-client";
import { supabaseServerClient } from "@/lib/supabase/server-client";

import { router } from "./orpc.router";

export const orpcServerClient = createRouterClient(router, {
  /**
   * Provide initial context if needed.
   *
   * Because this client instance is shared across all requests,
   * only include context that's safe to reuse globally.
   * For per-request context, use middleware context or pass a function as the initial context.
   */
  context: async () => ({
    reqHeaders: await headers(),
    db,
    redisClient,
    user: null,
    session: null,
    roles: null,
    permissions: null,
    supabaseClient: supabaseServerClient,
  }),
});

globalThis.$client = orpcServerClient;
