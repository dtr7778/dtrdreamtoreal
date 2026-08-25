import {
  createStorage,
  type IStorageService,
} from "@workspace/lib/supabase/storage";

import { env } from "@/lib/env";

import { supabaseServerClient } from "./supabase/server-client";

let _private_instance: IStorageService | undefined;
let _public_instance: IStorageService | undefined;

function getPrivateStorageInstance(): IStorageService {
  if (!_private_instance) {
    _private_instance = createStorage({
      supabaseClient: supabaseServerClient,
      bucket: env.SUPABASE_PRIVATE_STORAGE_BUCKET,
      bucketIsPublic: false,
    });
  }
  return _private_instance;
}

function getPublicStorageInstance(): IStorageService {
  if (!_public_instance) {
    _public_instance = createStorage({
      supabaseClient: supabaseServerClient,
      bucket: env.SUPABASE_PUBLIC_STORAGE_BUCKET,
      bucketIsPublic: true,
    });
  }
  return _public_instance;
}

export const publicStorage = getPublicStorageInstance();
export const privateStorage = getPrivateStorageInstance();
