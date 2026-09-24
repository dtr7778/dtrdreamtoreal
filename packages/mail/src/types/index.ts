import type {
  CreateEmailOptions,
  GetReceivingEmailResponseSuccess,
  InboundAttachment,
} from "resend";

import { DatabaseType } from "@workspace/drizzle/client";
import type { IUpstashRatelimit } from "@workspace/lib/rate-limit/upstash";
import type { ExtendedRedis } from "@workspace/lib/redis/upstash";

export interface QstashMailConfig {
  database: DatabaseType;
  redisClient: ExtendedRedis;
  minRatelimit: IUpstashRatelimit;
  hourRatelimit: IUpstashRatelimit;
  callbackUrl: string;
  receiptCallbackUrl: string;
  failureCallbackUrl: string;
  dedupWindowSeconds?: number;
}

/**
 * Config accepted by the BullMQ-backed mail service.
 *
 * No callback URLs: the backend worker processes the job (loads the persisted
 * email by id and sends it) and updates the shared database directly.
 */
export interface BullmqMailConfig {
  database: DatabaseType;
  redisClient: ExtendedRedis;
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

/** Result shape returned by the BullMQ-backed mail service. */
export interface BullmqMailResult {
  success: boolean;
  emailId?: string;
  threadId?: string;
  messageId?: string;
  error?: string;
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

export interface MailCallbackPayload {
  emailId: string;
  threadId?: string | undefined;
}

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
