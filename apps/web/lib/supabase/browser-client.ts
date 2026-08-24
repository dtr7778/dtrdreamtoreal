import {
  type BrowserSupabaseClient,
  createBrowserClient,
} from "@workspace/lib/supabase/browser-client";

import { env } from "@/lib/env";

let _instance: BrowserSupabaseClient | undefined;

function getSupabaseClientInstance(): BrowserSupabaseClient {
  if (!_instance) {
    _instance = createBrowserClient({
      url: env.NEXT_PUBLIC_SUPABASE_URL,
      key: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    });
  }
  return _instance;
}

export const supabaseBrowserClient = getSupabaseClientInstance();
