import { FileEntityTypeEnumType } from "@workspace/drizzle/zod-db-enums";
import type { ExtendedRedis } from "@workspace/lib/redis/upstash";

import { DEFAULT_FILE_CACHE_TIMEOUT } from "@/constants";

import { supabaseStorage } from "./storage";

export async function resolveFileUrl(
  image:
    | { key: string; entityType: FileEntityTypeEnumType | null | undefined }
    | null
    | undefined,
  context: { redisClient: ExtendedRedis }
): Promise<string | undefined> {
  if (!image || !image.entityType) {
    return undefined;
  }

  const cacheKey = `signed_url:${image.key}`;

  const imageUrlCache = await context.redisClient.get<string>(cacheKey);

  if (imageUrlCache) {
    return imageUrlCache;
  }

  const { signedUrl, expiresAt } = await supabaseStorage.getSignedDownloadUrl(
    image.key,
    image.entityType
  );

  let ttl = DEFAULT_FILE_CACHE_TIMEOUT;

  if (expiresAt) {
    const expiresInSeconds = Math.floor(expiresAt.getTime() / 1000);
    const nowInSeconds = Math.floor(Date.now() / 1000);
    ttl = expiresInSeconds - nowInSeconds - 60;
    if (ttl < 60) ttl = 300;
  }

  await context.redisClient.set(cacheKey, signedUrl, { ex: ttl });

  return signedUrl;
}
