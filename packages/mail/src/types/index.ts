import type {
  CreateEmailOptions,
  GetReceivingEmailResponseSuccess,
  InboundAttachment,
} from "resend";

import type { QueueMailServiceConfig } from "../producer";

export interface MailConfig {
  appName: string;
  systemMail: string;
  supportMail: string;
}

export interface MailServiceConfig extends QueueMailServiceConfig {
  mailConfig: MailConfig;
}

export interface QueueMailResult {
  success: boolean;
  emailId?: string;
  threadId?: string;
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
