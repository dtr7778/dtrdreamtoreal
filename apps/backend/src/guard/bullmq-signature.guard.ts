import { StatusCodes } from "http-status-codes";
import { injectable } from "inversify";

import {
  BULLMQ_TRANSPORT_HEADERS,
  verifyBullmqSignature,
} from "@workspace/lib/bullmq";
import {
  ApiError,
  getAllAndMergeMetadata,
  type IGuard,
  type IRequestExecutionContext,
} from "@workspace/lib/server";

import { API_MESSAGE } from "@/constant";
import { BULLMQ_SIGNATURE_METADATA_KEY } from "@/decorators/bullmq-signature.decorator";
import { env } from "@/env";

/**
 * Verifies the BullMQ transport signature declared with
 * `@RequireBullmqSignature()` on a controller or route.
 *
 * Resolution:
 * - no `@RequireBullmqSignature` declared → the whole request body is verified;
 * - otherwise the body key declared by the decorator is verified.
 *
 * A missing or invalid signature throws a 401 so the request is rejected before
 * the handler runs.
 */
@injectable()
export class BullmqSignatureGuard implements IGuard {
  public canActivate({
    request,
    controllerClass,
    handlerMethodName,
  }: IRequestExecutionContext): boolean {
    const [payloadKey] = getAllAndMergeMetadata<string>(
      BULLMQ_SIGNATURE_METADATA_KEY,
      [
        { target: controllerClass },
        { target: controllerClass, propertyKey: handlerMethodName },
      ]
    );

    const payload = payloadKey
      ? (request.body as Record<string, unknown> | undefined)?.[payloadKey]
      : request.body;

    const header = request.headers[BULLMQ_TRANSPORT_HEADERS.signature];
    const signature = Array.isArray(header) ? header[0] : header;

    if (!verifyBullmqSignature(env.BULLMQ_SIGNING_SECRET, payload, signature)) {
      throw new ApiError({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: API_MESSAGE.GENERAL.BULLMQ.INVALID_SIGNATURE,
      });
    }

    return true;
  }
}
