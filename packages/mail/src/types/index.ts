import type {
  CreateEmailOptions,
  GetReceivingEmailResponseSuccess,
  InboundAttachment,
} from "resend";

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
  deduplicationId?: string;
  error?: string;
}

/** Result shape returned by the BullMQ-backed mail service. */
export interface BullmqMailResult {
  success: boolean;
  emailId?: string;
  threadId?: string;
  messageId?: string;
  error?: string;
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

export type InboundEmailAttachment = InboundAttachment;

export type InboundEmailPayload = GetReceivingEmailResponseSuccess;

export interface InboundEmailResult {
  success: boolean;
  emailId?: string;
  threadId?: string;
  error?: string;
}
