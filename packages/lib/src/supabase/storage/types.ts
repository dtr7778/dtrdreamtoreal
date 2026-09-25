import type { SupabaseClient } from "@supabase/supabase-js";

export interface UploadedFile {
  id: string;
  path: string;
  fullPath: string;
  key: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface FileInfoType {
  id: string;
  name: string;
  size: number | undefined;
  etag: string | undefined;
  version: string;
  contentType: string | undefined;
  cacheControl: string | undefined;
}

export interface SignedUploadUrl {
  signedUrl: string;
  token: string;
  path: string;
  key: string;
  expiresAt: Date;
}

export interface SignedDownloadUrl {
  signedUrl: string;
  expiresAt?: Date;
}

export interface StorageServiceConfigs {
  supabaseClient: SupabaseClient;
  bucket: string;
  uploadExpirySeconds?: number;
  downloadExpirySeconds?: number;
  bucketIsPublic?: boolean;
}
