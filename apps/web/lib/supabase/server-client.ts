import {
  createServerClient,
  type ServerSupabaseClient,
} from "@workspace/lib/supabase/server-client";

import { env } from "@/lib/env";

let _instance: ServerSupabaseClient | undefined;

function getSupabaseClientInstance(): ServerSupabaseClient {
  if (!_instance) {
    _instance = createServerClient({
      url: env.NEXT_PUBLIC_SUPABASE_URL,
      key: env.SUPABASE_SECRET_KEY,
    });
  }
  return _instance;
}

export const supabaseServerClient = getSupabaseClientInstance();
