import { type IMailService, MailService } from "../services/Mail.service";
import type { MailServiceConfig } from "../types";

export function createMailService(config: MailServiceConfig): IMailService {
  return new MailService(config);
}
