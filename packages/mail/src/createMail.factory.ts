import { QstashServiceConfig } from "@workspace/lib/qstash";

import { IMailService, MailService } from "./MailService";
import { MailServiceConfig } from "./types";

type MailConfig = QstashServiceConfig & MailServiceConfig;

export function createMail(configs: MailConfig): IMailService {
  const qstashConfig: QstashServiceConfig = {
    redisClient: configs.redisClient,
    baseUrl: configs.baseUrl,
    token: configs.token,
    currentSigningKey: configs.currentSigningKey,
    nextSigningKey: configs.nextSigningKey,
    defaultQueue: configs.defaultQueue,
    defaultTopic: configs.defaultTopic,
    defaultRetries: configs.defaultRetries,
    defaultRetryDelay: configs.defaultRetryDelay,
  };

  const mailConfig: MailServiceConfig = {
    appName: configs.appName,
    fromEmail: configs.fromEmail,
    redisClient: configs.redisClient,
    minRatelimit: configs.minRatelimit,
    hourRatelimit: configs.hourRatelimit,
    callbackUrl: configs.callbackUrl,
    receiptCallbackUrl: configs.receiptCallbackUrl,
    failureCallbackUrl: configs.failureCallbackUrl,
    dedupWindowSeconds: configs.dedupWindowSeconds,
    supportMail: configs.supportMail,
    resendApiKey: configs.resendApiKey,
  };

  return new MailService(mailConfig, qstashConfig);
}
