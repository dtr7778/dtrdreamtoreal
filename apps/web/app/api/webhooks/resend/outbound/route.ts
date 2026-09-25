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
      env.RESEND_OUTBOUND_WEBHOOK_SECRET
    );

    if (eventPayload.type !== "email.delivered") {
      return ApiResponseJson(
        true,
        API_MESSAGES.GENERAL.RESEND.BAD_REQUEST,
        null,
        400
      );
    }

    await qstashMail.processMailDelivered(eventPayload.data.email_id);

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
