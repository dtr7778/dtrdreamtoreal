import { env as workerEnv } from "cloudflare:workers";
import { and, eq, isNull } from "drizzle-orm";
import { createDrizzleClient } from "@workspace/drizzle/client";
import { FileTable } from "@workspace/drizzle/schemas";
import { buildObjectKey, isKeyOwnedByUser } from "@workspace/lib/storage";
import { ApiError, apiResponse, BAD_REQUEST, FORBIDDEN, NOT_FOUND, OK, REQUEST_TOO_LONG, UNSUPPORTED_MEDIA_TYPE, } from "@workspace/server-core";
import { getEnv } from "@/lib/env";
import { API_MESSAGES, DEFAULT_UPLOAD_SCOPE, IMAGE_MIME_TYPES, IMAGE_UPLOAD_SIZE_BYTES, MAX_UPLOAD_SIZE_BYTES, } from "@/constant";
import { getStorageSigner } from "./r2.server";
function resolveUploadScope(input) {
    return input.scope ?? input.entityType ?? DEFAULT_UPLOAD_SCOPE;
}
function assertUploadAllowed(input) {
    const isProfileImage = input.entityType === "profile_image";
    let maxSize;
    switch (input.entityType) {
        case "profile_image":
            maxSize = IMAGE_UPLOAD_SIZE_BYTES;
            break;
        default:
            maxSize = MAX_UPLOAD_SIZE_BYTES;
            break;
    }
    if (input.size > maxSize) {
        throw new ApiError({
            message: API_MESSAGES.UPLOAD.TOO_LARGE,
            statusCode: REQUEST_TOO_LONG,
        });
    }
    if (isProfileImage &&
        !IMAGE_MIME_TYPES.includes(input.mimeType)) {
        throw new ApiError({
            message: API_MESSAGES.UPLOAD.UNSUPPORTED_TYPE,
            statusCode: UNSUPPORTED_MEDIA_TYPE,
        });
    }
}
async function getOwnedFile(db, fileId, user) {
    const [file] = await db
        .select()
        .from(FileTable)
        .where(and(eq(FileTable.id, fileId), isNull(FileTable.deletedAt)))
        .limit(1);
    if (!file) {
        throw new ApiError({
            statusCode: NOT_FOUND,
            message: API_MESSAGES.UPLOAD.NOT_FOUND,
        });
    }
    if (file.uploadedBy !== user.id) {
        throw new ApiError({
            statusCode: FORBIDDEN,
            message: API_MESSAGES.UPLOAD.NOT_ALLOWED,
        });
    }
    return file;
}
export const getFileHandler = async (c) => {
    const { id } = c.req.valid("param");
    const database = createDrizzleClient(c.env.DB);
    const [file] = await database
        .select()
        .from(FileTable)
        .where(eq(FileTable.id, id))
        .limit(1);
    if (!file) {
        throw new ApiError({
            statusCode: NOT_FOUND,
            message: API_MESSAGES.UPLOAD.NOT_FOUND,
        });
    }
    const object = await c.env.BUCKET.get(file.key, {
        range: c.req.raw.headers,
        onlyIf: c.req.raw.headers,
    });
    if (!object) {
        throw new ApiError({
            statusCode: NOT_FOUND,
            message: API_MESSAGES.UPLOAD.NOT_FOUND,
        });
    }
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Content-Type", file.mimeType);
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("Content-Disposition", `${c.req.query("download") === "1" ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(file.originalName)}`);
    if (!("body" in object) || !object.body) {
        return new Response(null, { status: 304, headers });
    }
    if (object.range && c.req.header("range")) {
        const r = object.range;
        const offset = r.offset ?? 0;
        const length = r.length ?? object.size - offset;
        headers.set("Content-Range", `bytes ${offset}-${offset + length - 1}/${object.size}`);
        headers.set("Content-Length", String(length));
        return new Response(object.body, { status: 206, headers });
    }
    headers.set("Content-Length", String(object.size));
    return new Response(object.body, { status: 200, headers });
};
export const getUploadUrlHandler = async (c) => {
    const input = c.req.valid("json");
    assertUploadAllowed(input);
    const user = c.get("user");
    const key = buildObjectKey({
        scope: resolveUploadScope(input),
        userId: user.id,
        filename: input.filename,
    });
    const uploadUrl = await getStorageSigner().presignUpload({
        key,
        contentType: input.mimeType,
    });
    return apiResponse(c, {
        message: API_MESSAGES.UPLOAD.GET_SIGNED_URL,
        statusCode: OK,
        success: true,
        data: {
            key,
            uploadUrl,
            expiresIn: getEnv("R2_UPLOAD_TTL"),
        },
    });
};
export const confirmUploadHandler = async (c) => {
    const input = c.req.valid("json");
    const user = c.get("user");
    if (!isKeyOwnedByUser(input.key, user.id)) {
        throw new ApiError({
            statusCode: FORBIDDEN,
            message: API_MESSAGES.UPLOAD.NOT_ALLOWED,
        });
    }
    const object = await workerEnv.BUCKET.head(input.key);
    if (!object) {
        throw new ApiError({
            statusCode: NOT_FOUND,
            message: API_MESSAGES.UPLOAD.NOT_FOUND,
        });
    }
    const mimeType = object.httpMetadata?.contentType ?? input.mimeType;
    try {
        assertUploadAllowed({
            entityType: input.entityType,
            mimeType,
            size: object.size,
        });
    }
    catch (error) {
        await workerEnv.BUCKET.delete(input.key);
        throw error;
    }
    const database = createDrizzleClient(c.env.DB);
    const id = crypto.randomUUID();
    const [file] = await database
        .insert(FileTable)
        .values({
        id,
        key: input.key,
        filename: input.filename,
        originalName: input.originalName,
        mimeType,
        size: object.size,
        url: `${getEnv("BACKEND_URL").replace(/\/$/, "")}/files/${id}`,
        uploadedBy: user.id,
        entityType: input.entityType,
        entityId: input.entityId,
    })
        .returning();
    if (!file) {
        throw new ApiError({
            statusCode: BAD_REQUEST,
            message: API_MESSAGES.UPLOAD.NOT_CREATE,
        });
    }
    return apiResponse(c, {
        success: true,
        statusCode: OK,
        message: API_MESSAGES.UPLOAD.CONFIRM_UPLOAD,
        data: file,
    });
};
export const assignEntityHandler = async (c) => {
    const input = c.req.valid("json");
    const user = c.get("user");
    const database = createDrizzleClient(c.env.DB);
    const file = await getOwnedFile(database, input.fileId, user);
    const [updated] = await database
        .update(FileTable)
        .set({ entityType: input.entityType, entityId: input.entityId })
        .where(eq(FileTable.id, file.id))
        .returning();
    if (!updated) {
        throw new ApiError({
            statusCode: NOT_FOUND,
            message: API_MESSAGES.UPLOAD.NOT_FOUND,
        });
    }
    return apiResponse(c, {
        success: true,
        message: API_MESSAGES.UPLOAD.ASSIGN_ENTITY,
        statusCode: OK,
        data: updated,
    });
};
export const deleteFileHandler = async (c) => {
    const input = c.req.valid("json");
    const user = c.get("user");
    const database = createDrizzleClient(c.env.DB);
    const file = await getOwnedFile(database, input.fileId, user);
    await workerEnv.BUCKET.delete(file.key);
    await database.delete(FileTable).where(eq(FileTable.id, file.id));
    return apiResponse(c, {
        success: true,
        message: API_MESSAGES.UPLOAD.DELETE,
        statusCode: OK,
        data: null,
    });
};
