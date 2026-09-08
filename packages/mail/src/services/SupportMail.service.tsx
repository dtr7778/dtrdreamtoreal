import { QstashServiceConfig } from "@workspace/lib/qstash";

import ContactReplyMail, {
  ContactReplyMailProps,
} from "../mail-templates/contact/ContactReplyMail";
import {
  IMailTransport,
  QstashMailConfig,
  QstashMailResult,
  SendMailOption,
} from "../types";
import { QstashMailService } from "./QstashMail.service";

type ContactReplyEmailOptions = Omit<
  SendMailOption,
  "from" | "text" | "html" | "subject"
> &
  Omit<ContactReplyMailProps, "appName" | "supportMail">;

export interface ISupportMailService {
  sendContactReplyMail(
    options: ContactReplyEmailOptions
  ): Promise<QstashMailResult>;
}

export class SupportMailService
  extends QstashMailService
  implements ISupportMailService
{
  constructor(
    private systemMailConfig: {
      appName: string;
      supportMail: string;
    },
    qstashMailConfig: QstashMailConfig,
    qstashConfig: QstashServiceConfig,
    transport: IMailTransport
  ) {
    super(
      transport,
      false,
      qstashMailConfig,
      qstashConfig,
      `"${systemMailConfig.appName}" <${systemMailConfig.supportMail}>`
    );
  }

  public async sendContactReplyMail({
    to,
    ...options
  }: ContactReplyEmailOptions): Promise<QstashMailResult> {
    return this.sendMailTemplate(
      to,
      `New reply on your contact: ${options.subject}`,
      <ContactReplyMail
        supportMail={this.systemMailConfig.supportMail}
        appName={this.systemMailConfig.appName}
        {...options}
      />,
      {
        replyTo: options.replyTo,
      }
    );
  }
}
