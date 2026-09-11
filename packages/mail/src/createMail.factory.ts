import { QstashServiceConfig } from "@workspace/lib/qstash";

import { ResendMailTransport } from "./ResendMail.transport";
import { IMailService, MailService } from "./services/Mail.service";
import { MailServiceConfig, QstashMailConfig } from "./types";

type MailConfig = MailServiceConfig &
  QstashServiceConfig &
  QstashMailConfig & {
    resendApiKey: string;
  };

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

  const qstashMailConfig: QstashMailConfig = {
    database: configs.database,
    redisClient: configs.redisClient,
    domainName: configs.domainName,
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

  return new MailService(
    mailServiceConfig,
    qstashMailConfig,
    qstashConfig,
    mailTransport
  );
}
