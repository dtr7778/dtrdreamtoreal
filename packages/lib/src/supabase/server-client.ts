import { createClient, type SupabaseClient } from "@supabase/supabase-js";

interface Configs {
  url: string;
  key: string;
}

export type ServerSupabaseClient = SupabaseClient;

export function createServerClient(config: Configs): ServerSupabaseClient {
  return createClient(config.url, config.key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
