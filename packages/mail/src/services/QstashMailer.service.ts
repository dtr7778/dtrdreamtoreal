import { type QstashServiceConfig } from "@workspace/lib/qstash";

import { type IMailTransport } from "../transports";
import type { MailServiceConfig, QstashMailResult } from "../types";
import {
  type IQstashMailService,
  type QstashMailConfig,
  QstashMailService,
} from "./QstashMail.service";
import {
  type IMailTemplates,
  withMailTemplates,
} from "./withMailTemplates.mixin";

export interface IQstashMailerService
  extends IQstashMailService, IMailTemplates<QstashMailResult> {}

export class QstashMailerService
  extends withMailTemplates<QstashMailResult, typeof QstashMailService>(
    QstashMailService
  )
  implements IQstashMailerService
{
  constructor(
    public readonly mailConfig: MailServiceConfig,
    qstashMailConfig: QstashMailConfig,
    qstashConfig: QstashServiceConfig,
    transport: IMailTransport
  ) {
    super(transport, qstashMailConfig, qstashConfig);
  }
}
