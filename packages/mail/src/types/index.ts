import type { CreateEmailOptions } from "resend";

import { DatabaseType } from "@workspace/drizzle/client";
import { EmailEventTypeEnumType } from "@workspace/drizzle/zod-db-enums";
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

export interface MailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

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

export interface ThreadingOptions {
  inReplyTo?: string;
  references?: string;
  originalMessageId?: string;
}

export type SendMailOption = Omit<CreateEmailOptions, "template" | "react"> & {
  threading?: ThreadingOptions;
  threadId?: string;
};

export type MailCallbackPayload = SendMailOption & {
  messageId: string;
  cleanMessageId: string;
  deduplicationId: string;
  emailId: string;
  threadId?: string | undefined;
};

export interface EmailEventPayload {
  eventType: EmailEventTypeEnumType;
  eventData: Record<string, unknown>;
}

export interface EventProcessResult {
  success: boolean;
  emailId?: string;
  eventType?: string;
  newStatus?: string;
  error?: string;
}

export interface InboundEmailAttachment {
  filename: string;
  content: string;
  contentType: string;
}

export interface InboundEmailPayload {
  from: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  headers?: Record<string, string>;
  messageId?: string;
  inReplyTo?: string;
  references?: string;
  attachments?: InboundEmailAttachment[];
}

export interface InboundEmailResult {
  success: boolean;
  emailId?: string;
  threadId?: string;
  error?: string;
}
