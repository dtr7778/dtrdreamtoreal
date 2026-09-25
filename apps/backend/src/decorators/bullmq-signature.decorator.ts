import { createMetadataDecorator } from "@workspace/lib/server";

export const BULLMQ_SIGNATURE_METADATA_KEY = "backend:bullmq:signature";

/**
 * Declares that a route's payload must carry a valid BullMQ signature.
 *
 * Combine with `@UseGuards(BullmqSignatureGuard)`. The optional value selects
 * the body key holding the signed payload (e.g. `"items"` for batch routes);
 * when omitted the whole request body is verified.
 */
export const RequireBullmqSignature = createMetadataDecorator<string>(
  BULLMQ_SIGNATURE_METADATA_KEY
);
