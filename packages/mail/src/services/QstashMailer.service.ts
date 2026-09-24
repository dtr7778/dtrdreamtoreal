import { QstashServiceConfig } from "@workspace/lib/qstash";

import {
  IMailTransport,
  MailServiceConfig,
  QstashMailConfig,
  QstashMailResult,
} from "../types";
import { IQstashMailService, QstashMailService } from "./QstashMail.service";
import { IMailTemplates, withMailTemplates } from "./withMailTemplates.mixin";

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
