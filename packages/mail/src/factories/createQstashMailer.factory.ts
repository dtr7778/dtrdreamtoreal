import { type QstashServiceConfig } from "@workspace/lib/qstash";

import { type QstashMailConfig } from "../services/QstashMail.service";
import {
  type IQstashMailerService,
  QstashMailerService,
} from "../services/QstashMailer.service";
import { ResendMailTransport } from "../transports/ResendMail.transport";
import type { MailServiceConfig } from "../types";

type QstashMailerConfig = MailServiceConfig &
  QstashServiceConfig &
  QstashMailConfig & {
    resendApiKey: string;
  };

export function createQstashMailer(
  configs: QstashMailerConfig
): IQstashMailerService {
  const qstashConfig: QstashServiceConfig = {
    redisClient: configs.redisClient,
    baseUrl: configs.baseUrl,
    token: configs.token,
    currentSigningKey: configs.currentSigningKey,
    nextSigningKey: configs.nextSigningKey,
    defaultQueue: configs.defaultQueue,
    defaultRetries: configs.defaultRetries,
    defaultRetryDelay: configs.defaultRetryDelay,
  };

  const qstashMailConfig: QstashMailConfig = {
    database: configs.database,
    redisClient: configs.redisClient,
    minRatelimit: configs.minRatelimit,
    hourRatelimit: configs.hourRatelimit,
    callbackUrl: configs.callbackUrl,
    receiptCallbackUrl: configs.receiptCallbackUrl,
    failureCallbackUrl: configs.failureCallbackUrl,
    dedupWindowSeconds: configs.dedupWindowSeconds,
  };

  const mailServiceConfig: MailServiceConfig = {
    appName: configs.appName,
    supportMail: configs.supportMail,
    systemMail: configs.systemMail,
  };

  const mailTransport = new ResendMailTransport(configs.resendApiKey);

  return new QstashMailerService(
    mailServiceConfig,
    qstashMailConfig,
    qstashConfig,
    mailTransport
  );
}
