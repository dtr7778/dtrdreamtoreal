import { createRoute, z } from "@hono/zod-openapi";

import { selectFileSchema } from "@workspace/drizzle/schemas";
import { FileEntityTypeEnumSchema } from "@workspace/drizzle/zod-db-enums";
import { apiOutputSchema } from "@workspace/lib/zod-schemas";
import { jsonContent, OK, routeMiddleware } from "@workspace/server-core";

import { authMiddleware } from "@/middlewares/auth.middleware";

const tags = ["Upload"];

export const getFileRoute = createRoute({
  method: "get",
  path: "/files/{id}",
  tags: ["Files"],
  summary: "Download or view a file",
  request: {
    params: z.object({
      id: z.uuid().openapi({
        param: { name: "id", in: "path" },
      }),
    }),
  },
  responses: {
    [OK]: {
      description: "File content",
      headers: z.object({
        "Content-Type": z.string(),
        "Content-Length": z.string(),
        "Content-Range": z.string().optional(),
        "Cache-Control": z.string(),
        ETag: z.string(),
      }),
      content: {
        "application/octet-stream": {
          schema: z.string().openapi({ format: "binary" }),
        },
      },
    },
  },
});

export const getUploadUrlRoute = createRoute({
  method: "post",
  path: "/upload/signed-url",
  tags,
  summary: "Create a signed URL to upload a file directly to R2",
  middleware: routeMiddleware(authMiddleware),
  request: {
    body: jsonContent(
      z.object({
        filename: z.string().min(1).max(255),
        mimeType: z.string().min(1).max(255),
        size: z.number().int().positive(),
        entityType: FileEntityTypeEnumSchema.optional(),
        entityId: z.string().min(1).max(255).optional(),
        scope: z
          .string()
          .min(1)
          .max(64)
          .regex(/^[a-zA-Z0-9_-]+$/, "Invalid upload scope")
          .optional(),
      }),
      "Get signed url"
    ),
  },
  responses: {
    [OK]: jsonContent(
      apiOutputSchema(
        z.object({
          key: z.string(),
          uploadUrl: z.string(),
          expiresIn: z.number(),
        })
      ),
      "Get signed url"
    ),
  },
});

export const confirmUploadRoute = createRoute({
  method: "post",
  path: "/upload/confirm",
  summary: "Persist an uploaded file as a database record",
  tags,
  middleware: routeMiddleware(authMiddleware),
  request: {
    body: jsonContent(
      z.object({
        key: z.string().min(1).max(1024),
        filename: z.string().min(1).max(255),
        originalName: z.string().min(1).max(255),
        mimeType: z.string().min(1).max(255),
        size: z.number().int().positive(),
        entityType: FileEntityTypeEnumSchema.optional(),
        entityId: z.string().min(1).max(255).optional(),
      }),
      "Persist uploaded file"
    ),
  },
  responses: {
    [OK]: jsonContent(
      apiOutputSchema(
        selectFileSchema.extend({
          entityType: FileEntityTypeEnumSchema.nullish(),
        })
      ),
      "Persist uploaded file"
    ),
  },
});

export const assignEntityRoute = createRoute({
  method: "post",
  path: "/upload/assign",
  summary: "Attach an uploaded file to an entity",
  tags,
  middleware: routeMiddleware(authMiddleware),
  request: {
    body: jsonContent(
      z.object({
        fileId: z.uuid(),
        entityType: FileEntityTypeEnumSchema,
        entityId: z.string().min(1).max(255),
      }),
      "Attach file entity"
    ),
  },
  responses: {
    [OK]: jsonContent(
      apiOutputSchema(
        selectFileSchema.extend({
          entityType: FileEntityTypeEnumSchema.nullish(),
        })
      ),
      "Attach file entity"
    ),
  },
});

export const deleteFileRoute = createRoute({
  method: "post",
  path: "/upload/delete",
  summary: "Delete a file from R2 and soft-delete its record",
  tags,
  middleware: routeMiddleware(authMiddleware),
  request: {
    body: jsonContent(z.object({ fileId: z.uuid() }), "Delete file"),
  },
  responses: {
    [OK]: jsonContent(apiOutputSchema(z.null()), "Delete file"),
  },
});

export type GetFileRouteType = typeof getFileRoute;
export type GetUploadUrlRouteType = typeof getUploadUrlRoute;
export type ConfirmUploadRouteType = typeof confirmUploadRoute;
export type AssignEntityRouteType = typeof assignEntityRoute;
export type DeleteFileRouteType = typeof deleteFileRoute;
