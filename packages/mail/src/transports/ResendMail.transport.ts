import { CreateEmailOptions, Resend } from "resend";

import { MailError } from "@workspace/lib/utils";

import type { MailSendResult } from "../types";

export interface IMailTransport {
  send(options: CreateEmailOptions): Promise<MailSendResult>;
}

export class ResendMailTransport implements IMailTransport {
  private readonly resend: Resend;

  constructor(resendApiKey: string) {
    this.resend = new Resend(resendApiKey);
  }

  public async send(options: CreateEmailOptions): Promise<MailSendResult> {
    if (!options.html && !options.text) {
      throw new MailError(
        "Either 'html' or 'text' must be provided.",
        "MAIL_INVALID_PAYLOAD",
        400
      );
    }

    try {
      const info = await this.resend.emails.send(options);

      if (!info.data) {
        throw new MailError(info.error.message, "MAIL_TRANSPORT_FAILED");
      }

      return info.data.id;
    } catch (err) {
      if (err instanceof MailError) throw err;

      throw new MailError(
        err instanceof Error ? err.message : "Unknown error occurred",
        "MAIL_TRANSPORT_FAILED"
      );
    }
  }
}
