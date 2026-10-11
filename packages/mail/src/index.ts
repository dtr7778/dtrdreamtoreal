export * from "./services/Email.service";
export * from "./services/EmailThread.service";
export type { IMailService } from "./services/Mail.service";
export type {
  QueueMailResult,
  SendMailOption,
  MailConfig,
  MailServiceConfig,
  InboundEmailPayload,
  InboundEmailAttachment,
  InboundEmailResult,
} from "./types";
