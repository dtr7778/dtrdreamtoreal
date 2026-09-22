import type {
  CreateEmailOptions,
  GetReceivingEmailResponseSuccess,
  InboundAttachment,
} from "resend";

import { DatabaseType } from "@workspace/drizzle/client";
import type { IRatelimit } from "@workspace/lib/rate-limit";
import type { ExtendedRedis } from "@workspace/lib/redis";

export interface QstashMailConfig {
  database: DatabaseType;
  redisClient: ExtendedRedis;
  domainName: string;
  minRatelimit: IRatelimit;
  hourRatelimit: IRatelimit;
  callbackUrl: string;
  receiptCallbackUrl: string;
  failureCallbackUrl: string;
  dedupWindowSeconds?: number;
}

export interface MailServiceConfig {
  appName: string;
  systemMail: string;
  supportMail: string;
}

export type MailSendResult = string;

export interface QstashMailResult {
  success: boolean;
  emailId?: string;
  threadId?: string;
  qMessageId?: string;
  error?: string;
  deduplicationId?: string;
}

export interface IMailTransport {
  send(options: CreateEmailOptions): Promise<MailSendResult>;
}

export type SendMailOption = Omit<
  CreateEmailOptions,
  "template" | "react" | "from"
> & {
  from: string;
  threadId?: string | undefined;
  inReplyTo?: string | undefined;
  references?: string[] | undefined;
};

export type MailCallbackPayload = SendMailOption & {
  emailId: string;
  threadId?: string | undefined;
  deduplicationId?: string;
};

/**
 * A single entry passed to `sendMailBatch`.
 */
export interface SendMailBatchItem {
  /** The mail to send. */
  options: SendMailOption;
  /** Whether this is a system mail (skips thread creation). Defaults to true. */
  isSystemMail?: boolean;
}

export type InboundEmailAttachment = InboundAttachment;

export type InboundEmailPayload = GetReceivingEmailResponseSuccess;

export interface InboundEmailResult {
  success: boolean;
  emailId?: string;
  threadId?: string;
  error?: string;
}
