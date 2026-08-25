import { EntityTypeEnumType } from "@workspace/drizzle/zod-db-enums";
import { ExtendedRedis } from "@workspace/lib/redis";

import { DEFAULT_FILE_CACHE_TIMEOUT } from "@/constants";

import { determineStorageType } from "./determineStorageType";
import { privateStorage, publicStorage } from "./storage";

export async function resolveFileUrl(
  image:
    | { key: string; entityType: EntityTypeEnumType | null | undefined }
    | null
    | undefined,
  context: { redisClient: ExtendedRedis }
): Promise<string | undefined> {
  if (!image || !image.entityType) {
    return undefined;
  }

  const storageType = determineStorageType(image.entityType);
  const cacheKey = `signed_url:${storageType}:${image.key}`;

  const imageUrlCache = await context.redisClient.get<string>(cacheKey);

  if (imageUrlCache) {
    return imageUrlCache;
  }

  const storage = storageType === "public" ? publicStorage : privateStorage;
  const { signedUrl, expiresAt } = await storage.getSignedDownloadUrl(
    image.key,
    image.entityType
  );

  if (storageType === "private") {
    let ttl = DEFAULT_FILE_CACHE_TIMEOUT;

    if (expiresAt) {
      const expiresInSeconds = Math.floor(expiresAt.getTime() / 1000);
      const nowInSeconds = Math.floor(Date.now() / 1000);
      ttl = expiresInSeconds - nowInSeconds - 60;
      if (ttl < 60) ttl = 300;
    }

    await context.redisClient.set(cacheKey, signedUrl, { ex: ttl });
  } else {
    await context.redisClient.set(cacheKey, signedUrl);
  }

  return signedUrl;
}
