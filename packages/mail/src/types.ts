import type { CreateEmailOptions } from "resend";

import type { IRatelimit } from "@workspace/lib/rate-limit";
import type { ExtendedRedis } from "@workspace/lib/redis";
import type { DistributiveOmit } from "@workspace/lib/types";

export interface QstashMailConfig {
  appName: string;
  fromEmail: string;
  redisClient: ExtendedRedis;
  minRatelimit: IRatelimit;
  hourRatelimit: IRatelimit;
  callbackUrl: string;
  receiptCallbackUrl: string;
  failureCallbackUrl: string;
  dedupWindowSeconds?: number;
}

export interface MailServiceConfig extends QstashMailConfig {
  supportMail: string;
  resendApiKey: string;
}

export interface MailSendResult {
  success: boolean;
  error?: string;
}

export interface QstashMailResult extends MailSendResult {
  messageId?: string;
  deduplicationId?: string;
  rateLimited?: boolean;
  duplicate?: boolean;
}

export interface IMailTransport {
  send(options: CreateEmailOptions): Promise<MailSendResult>;
}

export type SendMailOption = DistributiveOmit<CreateEmailOptions, "from">;

export type MailCallbackPayload = SendMailOption & {
  messageId: string;
  deduplicationId: string;
  from: string;
  createdBy?: string;
  ipAddress?: string;
  userAgent?: string;
};
