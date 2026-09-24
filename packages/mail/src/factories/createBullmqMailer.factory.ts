import { BullmqServiceConfig } from "@workspace/lib/bullmq";

import {
  BullmqMailerService,
  IBullmqMailerService,
} from "../services/BullmqMailer.service";
import { BullmqMailConfig, MailServiceConfig } from "../types";

type BullmqMailConfigFull = MailServiceConfig &
  BullmqServiceConfig &
  BullmqMailConfig;

export function createBullmqMailer(
  configs: BullmqMailConfigFull
): IBullmqMailerService {
  const bullmqConfig: BullmqServiceConfig = {
    signingSecret: configs.signingSecret,
    publisher: configs.publisher,
    defaultRetries: configs.defaultRetries,
  };

  const bullmqMailConfig: BullmqMailConfig = {
    database: configs.database,
    redisClient: configs.redisClient,
    dedupWindowSeconds: configs.dedupWindowSeconds,
  };

  const mailServiceConfig: MailServiceConfig = {
    appName: configs.appName,
    supportMail: configs.supportMail,
    systemMail: configs.systemMail,
  };

  return new BullmqMailerService(
    mailServiceConfig,
    bullmqMailConfig,
    bullmqConfig
  );
}
