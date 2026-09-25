import { createClient, type SupabaseClient } from "@supabase/supabase-js";

interface Configs {
  url: string;
  key: string;
}

export type BrowserSupabaseClient = SupabaseClient;

export function createBrowserClient(config: Configs): BrowserSupabaseClient {
  return createClient(config.url, config.key, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
}
