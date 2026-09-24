import { StatusCodes } from "http-status-codes";
import { injectable } from "inversify";

import { verifyBullmqSignature } from "@workspace/lib/bullmq";
import { ApiError } from "@workspace/lib/server";

import { API_MESSAGE } from "@/constant";
import { env } from "@/env";

/**
 * Verifies inbound BullMQ enqueue requests using the shared HMAC secret. Only
 * our own services know the secret, so a valid signature proves the caller is
 * internal.
 *
 * Payloads are canonicalized (keys sorted) before signing so verification is
 * independent of JSON key ordering.
 */
@injectable()
export class QueueSignatureService {
  /** Verify a parsed request payload against an inbound signature. */
  public verify(payload: unknown, signature: string | undefined): boolean {
    return verifyBullmqSignature(env.BULLMQ_SIGNING_SECRET, payload, signature);
  }
  /** Verify or throw error. */
  public verifyOrThrow(payload: unknown, signature: string | undefined): void {
    const isVerified = this.verify(payload, signature);
    if (!isVerified) {
      throw new ApiError({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: API_MESSAGE.GENERAL.BULLMQ.INVALID_SIGNATURE,
      });
    }
  }
}
