import { implement, ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";

import { FileTable, InsertFile } from "@workspace/drizzle/schemas";
import { apiResponse } from "@workspace/lib/utils";

import { determineStorageType } from "@/lib/determineStorageType";
import { resolveFileUrl } from "@/lib/resolveFileUrl";
import { privateStorage, publicStorage } from "@/lib/storage";

import { DEFAULT_FILE_CACHE_TIMEOUT } from "@/constants";
import { API_MESSAGES } from "@/constants/apiMessage";
import { authMiddleware } from "@/server/middleware/auth.middleware";
import { errorMiddleware } from "@/server/middleware/error.middleware";
import { privateRateLimitMiddleware } from "@/server/middleware/rateLimit.middleware";
import { ORPCContext } from "@/types/orpc.types";

import { uploadContract } from "./upload.contract";

export const uploadImpl = implement(uploadContract)
  .$context<ORPCContext>()
  .use(errorMiddleware)
  .use(privateRateLimitMiddleware)
  .use(authMiddleware);

export const getSignedUploadUrlProcedure =
  uploadImpl.getSignedUploadUrl.handler(async ({ input }) => {
    const storageType = determineStorageType(input.entityType);

    const storage = storageType === "public" ? publicStorage : privateStorage;

    const signedUrl = await storage.getSignedUploadUrl(
      input.filename,
      input.path
    );

    return apiResponse(API_MESSAGES.UPLOAD.GET_SIGNED_URL, {
      signedUrl: signedUrl.signedUrl,
      key: signedUrl.key,
      token: signedUrl.token,
      path: signedUrl.path,
    });
  });

export const getSignedDownloadUrlProcedure =
  uploadImpl.getSignedDownloadUrl.handler(async ({ input, context }) => {
    const storageType = determineStorageType(input.entityType);

    const cacheKey = `signed_url:${storageType}:${input.key}`;
    const imageUrlCache = await context.redisClient.get<string>(cacheKey);

    let signedUrl: {
      signedUrl: string;
      expiresAt?: Date;
    };

    if (imageUrlCache) {
      signedUrl = {
        signedUrl: imageUrlCache,
        expiresAt: undefined,
      };
    } else {
      const storage = storageType === "public" ? publicStorage : privateStorage;
      signedUrl = await storage.getSignedDownloadUrl(
        input.key,
        input.entityType
      );

      if (storageType === "private") {
        let ttl = DEFAULT_FILE_CACHE_TIMEOUT;

        if (signedUrl.expiresAt) {
          const expiresInSeconds = Math.floor(
            signedUrl.expiresAt.getTime() / 1000
          );
          const nowInSeconds = Math.floor(Date.now() / 1000);

          ttl = expiresInSeconds - nowInSeconds - 60;

          if (ttl < 60) ttl = 300;
        }
        await context.redisClient.set(cacheKey, signedUrl.signedUrl, {
          ex: ttl,
        });
      } else {
        await context.redisClient.set(cacheKey, signedUrl.signedUrl);
      }
    }

    return apiResponse(API_MESSAGES.UPLOAD.GET_DOWNLOAD_URL, {
      signedUrl: signedUrl.signedUrl,
      expiresAt: signedUrl?.expiresAt,
    });
  });

export const confirmUploadProcedure = uploadImpl.confirm.handler(
  async ({ input, context, errors }) => {
    const storageType = determineStorageType(input.entityType);
    const storage = storageType === "public" ? publicStorage : privateStorage;

    const fileInfo = await storage.find(input.key, input.path);
    if (!fileInfo) {
      throw errors.NOT_FOUND();
    }

    const fileUrl = await resolveFileUrl(
      {
        key: input.key,
        entityType: input.entityType,
      },
      {
        redisClient: context.redisClient,
      }
    );

    if (!fileUrl) {
      throw new ORPCError("INTERNAL_SERVER_ERROR");
    }

    const [newFile] = await context.db
      .insert(FileTable)
      .values({
        key: input.key,
        filename: input.filename,
        originalName: input.originalName,
        mimeType: input.mimeType,
        size: input.size,
        url: fileUrl,
        uploadedBy: context.user.id,
        entityType: input.entityType,
        entityId: input.entityId,
      } satisfies InsertFile)
      .returning({ id: FileTable.id });

    if (!newFile) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.UPLOAD.NOT_CREATE,
      });
    }

    if (storageType === "public") {
      const fileDownloadUrl = await storage.getSignedDownloadUrl(
        input.key,
        input.path
      );

      const cacheKey = `signed_url:${storageType}:${input.key}`;

      await context.redisClient.set(cacheKey, fileDownloadUrl);
    }

    return apiResponse(API_MESSAGES.UPLOAD.CONFIRM_UPLOAD, {
      key: input.key,
      id: newFile.id,
    });
  }
);

export const assignFileEntityProcedure = uploadImpl.assignEntity.handler(
  async ({ input, context, errors }) => {
    const [existFile] = await context.db
      .select({ id: FileTable.id, key: FileTable.key })
      .from(FileTable)
      .where(eq(FileTable.key, input.key))
      .limit(1);

    if (!existFile) {
      throw errors.NOT_FOUND();
    }

    const storageType = determineStorageType(input.entityType);

    const storage = storageType === "public" ? publicStorage : privateStorage;

    const isExist = await storage.exists(input.key, input.path);
    if (!isExist) {
      throw errors.NOT_FOUND();
    }

    await context.db
      .update(FileTable)
      .set({ entityType: input.entityType, entityId: input.entityId })
      .where(eq(FileTable.id, existFile.id));

    return apiResponse(API_MESSAGES.UPLOAD.ASSIGN_ENTITY, null);
  }
);

export const deleteUploadProcedure = uploadImpl.delete.handler(
  async ({ input, context, errors }) => {
    const [existFile] = await context.db
      .select({ id: FileTable.id, key: FileTable.key })
      .from(FileTable)
      .where(
        and(
          eq(FileTable.key, input.key),
          eq(FileTable.uploadedBy, context.user.id)
        )
      )
      .limit(1);

    if (!existFile) {
      throw errors.NOT_FOUND();
    }

    const storageType = determineStorageType(input.entityType);
    const storage = storageType === "public" ? publicStorage : privateStorage;

    const isExist = await storage.exists(input.key, input.path);
    if (!isExist) {
      throw errors.NOT_FOUND();
    }

    await storage.delete(existFile.key, input.path);

    await context.db.delete(FileTable).where(eq(FileTable.id, existFile.id));

    return apiResponse(API_MESSAGES.UPLOAD.DELETE, null);
  }
);
