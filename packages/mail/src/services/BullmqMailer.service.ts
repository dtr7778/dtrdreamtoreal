import { type BullmqServiceConfig } from "@workspace/lib/bullmq";

import {
  BullmqMailConfig,
  BullmqMailResult,
  MailServiceConfig,
} from "../types";
import { BullmqMailService, IBullmqMailService } from "./BullmqMail.service";
import { IMailTemplates, withMailTemplates } from "./withMailTemplates.mixin";

export interface IBullmqMailerService
  extends IBullmqMailService, IMailTemplates<BullmqMailResult> {}

export class BullmqMailerService
  extends withMailTemplates<BullmqMailResult, typeof BullmqMailService>(
    BullmqMailService
  )
  implements IBullmqMailerService
{
  constructor(
    public readonly mailConfig: MailServiceConfig,
    bullmqMailConfig: BullmqMailConfig,
    bullmqConfig: BullmqServiceConfig
  ) {
    super(bullmqMailConfig, bullmqConfig);
  }
}
