import {
  createStorage,
  type IStorageService,
} from "@workspace/lib/supabase/storage";

import { env } from "@/lib/env";

import { supabaseServerClient } from "./supabase/server-client";

let _instance: IStorageService | undefined;

function getStorageInstance(): IStorageService {
  if (!_instance) {
    _instance = createStorage({
      supabaseClient: supabaseServerClient,
      bucket: env.SUPABASE_STORAGE_BUCKET_NAME,
      bucketIsPublic: true,
    });
  }
  return _instance;
}

export const supabaseStorage = getStorageInstance();
