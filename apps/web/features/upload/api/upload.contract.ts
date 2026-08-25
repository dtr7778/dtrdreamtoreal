import z from "zod";

import { insertFileSchema } from "@workspace/drizzle/schemas";
import { EntityTypeEnumSchema } from "@workspace/drizzle/zod-db-enums";
import { apiOutputZodSchema } from "@workspace/lib/utils";

import { API_MESSAGES } from "@/constants/apiMessage";
import { baseContract } from "@/server/orpc.contract-base";
import { InferContractRouterType } from "@/types/orpc.types";

const uploadBaseContract = baseContract.errors({
  NOT_FOUND: {
    code: 404,
    success: false,
    message: API_MESSAGES.UPLOAD.NOT_FOUND,
  },
});

const tags = ["Upload"] as const;

const getSignedUploadUrlContract = uploadBaseContract
  .route({
    path: "/upload/get-signed-url",
    description: "Get a signed URL to upload a file",
    tags,
  })
  .input(
    z.object({
      filename: z.string().min(1).max(255),
      entityType: EntityTypeEnumSchema,
      path: z.string(),
    })
  )
  .output(
    apiOutputZodSchema(
      z.object({
        signedUrl: z.url(),
        key: z.string(),
        token: z.string(),
        path: z.string(),
      })
    )
  );
export type GetSignedUploadUrlContractType = InferContractRouterType<
  typeof getSignedUploadUrlContract
>;

const getSignedDownloadUrlContract = uploadBaseContract
  .route({
    path: "/upload/get-download-url",
    description: "Get a signed URL to download a file",
    tags,
  })
  .input(
    z.object({
      key: z.string().min(1),
      entityType: EntityTypeEnumSchema,
    })
  )
  .output(
    apiOutputZodSchema(
      z.object({
        signedUrl: z.url(),
        expiresAt: z.date().optional(),
      })
    )
  );
export type GetSignedDownloadUrlContractType = InferContractRouterType<
  typeof getSignedDownloadUrlContract
>;

const confirmUploadContract = uploadBaseContract
  .route({
    path: "/upload/confirm",
    description: "Confirm a file upload",
    tags,
  })
  .input(
    insertFileSchema
      .pick({
        key: true,
        filename: true,
        originalName: true,
        mimeType: true,
        size: true,
        entityId: true,
      })
      .extend({
        path: z.string(),
        entityType: EntityTypeEnumSchema,
      })
  )
  .output(
    apiOutputZodSchema(
      z.object({
        id: z.uuid(),
        key: z.string(),
      })
    )
  );
export type ConfirmUploadContractType = InferContractRouterType<
  typeof confirmUploadContract
>;

const assignFileEntityContract = uploadBaseContract
  .route({
    path: "/upload/assign-entity",
    description: "Assign a file to an entity",
    tags,
  })
  .input(
    z.object({
      key: z.string().min(1),
      entityType: EntityTypeEnumSchema,
      entityId: z.uuid(),
      path: z.string(),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type AssignFileEntityContractType = InferContractRouterType<
  typeof assignFileEntityContract
>;

const deleteUploadContract = uploadBaseContract
  .route({
    path: "/upload/delete",
    description: "Delete a previously uploaded file",
    tags,
  })
  .input(
    z.object({
      key: z.string().min(1),
      entityType: EntityTypeEnumSchema,
      path: z.string(),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type DeleteUploadContractType = InferContractRouterType<
  typeof deleteUploadContract
>;

export const uploadContract = {
  getSignedUploadUrl: getSignedUploadUrlContract,
  getSignedDownloadUrl: getSignedDownloadUrlContract,
  confirm: confirmUploadContract,
  assignEntity: assignFileEntityContract,
  delete: deleteUploadContract,
};
