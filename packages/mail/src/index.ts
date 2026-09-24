export * from "./factories/createQstashMailer.factory";
export * from "./factories/createBullmqMailer.factory";
export { createMailProcessor } from "./services/MailProcessor.service";
export type { IMailProcessor } from "./services/MailProcessor.service";
export type { IQstashMailerService } from "./services/QstashMailer.service";
export type { IBullmqMailerService } from "./services/BullmqMailer.service";
export type { IBullmqMailService } from "./services/BullmqMail.service";
export type {
  InboundEmailPayload,
  InboundEmailResult,
  MailCallbackPayload,
  SendMailBatchItem,
  BullmqMailConfig,
  BullmqMailResult,
} from "./types";
