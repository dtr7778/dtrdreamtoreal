import { NextRequest } from "next/server";

import { env } from "@/lib/env";
import { qstashMail } from "@/lib/mail/qstash-mail";
import { verifyResendWebhook } from "@/lib/resend/verifyResendWebhook";

import { API_MESSAGES } from "@/constants/apiMessage";
import { ApiResponseJson } from "@/utils/ApiResponseJson";
import { formatApiError } from "@/utils/formatApiError";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();

    const eventPayload = verifyResendWebhook(
      req.headers,
      payload,
      env.RESEND_EVENT_WEBHOOK_SECRET
    );

    switch (eventPayload.type) {
      case "email.sent":
        await qstashMail.processMailSent(
          eventPayload.data.email_id,
          eventPayload.data.message_id
        );
        break;
      case "email.failed":
        await qstashMail.processMailFailed(eventPayload.data.email_id);
        break;
      case "email.bounced":
        await qstashMail.processMailBounced(eventPayload.data.email_id);
        break;
      case "email.complained":
        await qstashMail.processMailComplained(eventPayload.data.email_id);
        break;
      case "email.suppressed":
        await qstashMail.processMailSuppressed(eventPayload.data.email_id);
        break;
      case "email.delivery_delayed":
        await qstashMail.processMailDeliveryDelayed(eventPayload.data.email_id);
        break;
      default:
        return ApiResponseJson(
          true,
          API_MESSAGES.GENERAL.RESEND.BAD_REQUEST,
          null,
          400
        );
    }

    return ApiResponseJson(
      true,
      API_MESSAGES.GENERAL.RESEND.COMPLETED,
      null,
      200
    );
  } catch (err) {
    const { message, statusCode } = formatApiError(err);

    return ApiResponseJson(false, message, null, statusCode);
  }
}
