import { createMetadataDecorator } from "@workspace/lib/server";

export const RESEND_WEBHOOK_METADATA_KEY = "backend:resend:webhook";

/** Resend webhook channels, each signed with its own secret. */
export type ResendWebhookChannel = "inbound" | "outbound";

/**
 * Declares which Resend webhook secret signs a route.
 *
 * Combine with `@UseGuards(ResendWebhookGuard)`. The guard verifies the
 * signature and exposes the decoded event on `request.resendWebhook`.
 */
export const RequireResendWebhook =
  createMetadataDecorator<ResendWebhookChannel>(RESEND_WEBHOOK_METADATA_KEY);
