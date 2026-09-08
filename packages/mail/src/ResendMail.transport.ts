import { CreateEmailOptions, Resend } from "resend";

import type { IMailTransport, MailSendResult } from "./types";

export class ResendMailTransport implements IMailTransport {
  private readonly resend: Resend;

  constructor(resendApiKey: string) {
    this.resend = new Resend(resendApiKey);
  }

  public async send(options: CreateEmailOptions): Promise<MailSendResult> {
    if (!options.html && !options.text) {
      return {
        success: false,
        error: "Either 'html' or 'text' must be provided.",
      };
    }

    try {
      const info = await this.resend.emails.send(options);

      if (!info.data) {
        return {
          success: false,
          error: info.error.message,
        };
      }

      return { success: true, messageId: info.data.id };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
