import { StatusCodes } from "http-status-codes";
import { injectable } from "inversify";
import { Resend } from "resend";

import {
  ApiError,
  getAllAndMergeMetadata,
  IGuard,
  IRequestExecutionContext,
} from "@workspace/server-core/framework";

import { API_MESSAGE } from "@/constant";
import {
  RESEND_WEBHOOK_METADATA_KEY,
  type ResendWebhookChannel,
} from "@/decorators/resend-webhook.decorator";
import { env } from "@/env";

const WEBHOOK_SECRETS: Record<ResendWebhookChannel, string> = {
  inbound: env.RESEND_INBOUND_WEBHOOK_SECRET,
  outbound: env.RESEND_OUTBOUND_WEBHOOK_SECRET,
};

function readHeader(
  request: IRequestExecutionContext["request"],
  name: string
): string | undefined {
  const value = request.headers[name];

  return Array.isArray(value) ? value[0] : value;
}

/**
 * Verifies the Resend (svix) webhook signature declared with
 * `@RequireResendWebhook(channel)` and exposes the decoded event on
 * `request.resendWebhook`.
 *
 * Missing headers/body throw a 400 and an invalid signature throws a 401, so
 * the request is rejected before the handler runs.
 */
@injectable()
export class ResendWebhookGuard implements IGuard {
  private readonly resend = new Resend(env.RESEND_API_KEY);

  public canActivate({
    request,
    controllerClass,
    handlerMethodName,
  }: IRequestExecutionContext): boolean {
    const channels = getAllAndMergeMetadata<ResendWebhookChannel>(
      RESEND_WEBHOOK_METADATA_KEY,
      [
        { target: controllerClass },
        { target: controllerClass, propertyKey: handlerMethodName },
      ]
    );

    const channel = channels[0] ?? "outbound";

    const id = readHeader(request, "svix-id");
    const timestamp = readHeader(request, "svix-timestamp");
    const signature = readHeader(request, "svix-signature");
    const payload = request.rawBody;

    if (!id || !timestamp || !signature || !payload) {
      throw new ApiError({
        statusCode: StatusCodes.BAD_REQUEST,
        message: API_MESSAGE.GENERAL.RESEND.INVALID_REQUEST,
      });
    }

    try {
      request.resendWebhookEventPayload = this.resend.webhooks.verify({
        payload,
        headers: { id, timestamp, signature },
        webhookSecret: WEBHOOK_SECRETS[channel],
      });
    } catch {
      throw new ApiError({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: API_MESSAGE.GENERAL.RESEND.INVALID_REQUEST,
      });
    }

    return true;
  }
}
