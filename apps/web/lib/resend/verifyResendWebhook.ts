import { MailError } from "@workspace/mail/error";

import { API_MESSAGES } from "@/constants/apiMessage";

import { resend } from ".";

export function verifyResendWebhook(
  headers: Headers,
  payload: string,
  webhookSecret: string
) {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signature = headers.get("svix-signature");

  if (!id || !timestamp || !signature) {
    throw new MailError(
      API_MESSAGES.GENERAL.RESEND.BAD_REQUEST,
      "MAIL_BAD_REQUEST",
      400
    );
  }

  return resend.webhooks.verify({
    payload,
    headers: {
      id,
      timestamp,
      signature,
    },
    webhookSecret,
  });
}
