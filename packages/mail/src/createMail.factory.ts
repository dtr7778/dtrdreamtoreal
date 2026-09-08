import { QstashServiceConfig } from "@workspace/lib/qstash";

import { ResendMailTransport } from "./ResendMail.transport";
import { SupportMailService } from "./services/SupportMail.service";
import { SystemMailService } from "./services/SystemMail.service";
import { QstashMailConfig } from "./types";

type MailConfig = QstashServiceConfig &
  QstashMailConfig & {
    appName: string;
    systemMail: string;
    supportMail: string;
    resendApiKey: string;
  };

export function createMail(configs: MailConfig) {
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

  const mailTransport = new ResendMailTransport(configs.resendApiKey);

  const systemService = new SystemMailService(
    {
      appName: configs.appName,
      supportMail: configs.supportMail,
      systemMail: configs.systemMail,
    },
    qstashMailConfig,
    qstashConfig,
    mailTransport
  );

  const supportService = new SupportMailService(
    {
      appName: configs.appName,
      supportMail: configs.supportMail,
    },
    qstashMailConfig,
    qstashConfig,
    mailTransport
  );

  return {
    system: systemService,
    support: supportService,
  };
}
