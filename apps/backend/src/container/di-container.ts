import {
  createDrizzleClient,
  type DatabaseType,
} from "@workspace/drizzle/client/ioRedis";
import { logger, type LoggerType } from "@workspace/lib/logger";
import { createRedisClient, ExtendedRedis } from "@workspace/lib/redis/ioRedis";
import { container } from "@workspace/lib/server";
import { createMailProcessor, type IMailProcessor } from "@workspace/mail";

import { QueueSignatureService } from "@/helpers/QueueSignature.service";
import { AuditQueueService } from "@/modules/audit/AuditQueue.service";
import { AuditService, IAuditService } from "@/modules/audit/Audit.service";
import { AuditCronService } from "@/modules/audit/AuditCron.service";
import { CruxClient } from "@/modules/audit/clients/crux.client";
import { GoogleApiCache } from "@/modules/audit/clients/google-cache";
import { PsiClient } from "@/modules/audit/clients/psi.client";
import { MailController } from "@/modules/mail/Mail.controller";
import { MailQueueService } from "@/modules/mail/MailQueue.service";
import { ResendMailController } from "@/modules/mail/ResendMail.controller";

import { env } from "../env";
import { SiteAuditController } from "../modules/audit/SiteAudit.controller";
import { CONTAINER_TYPES } from "./container-types";

container
  .bind<ExtendedRedis>(CONTAINER_TYPES.Redis)
  .toDynamicValue(() =>
    createRedisClient({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      username: env.REDIS_USERNAME,
      password: env.REDIS_PASSWORD,
    })
  )
  .inSingletonScope();
container
  .bind<DatabaseType>(CONTAINER_TYPES.Drizzle)
  .toDynamicValue(() =>
    createDrizzleClient({
      databaseUrl: env.DATABASE_URL,
      isProd: env.NODE_ENV === "production",
      operationMode: "normal",
      redis: container.get<ExtendedRedis>(CONTAINER_TYPES.Redis),
    })
  )
  .inSingletonScope();

container
  .bind<LoggerType>(CONTAINER_TYPES.Logger)
  .toDynamicValue(() =>
    logger({
      serviceName: "backend",
      logLevel: env.API_LOG_LEVEL,
    })
  )
  .inRequestScope();

container
  .bind<GoogleApiCache>(CONTAINER_TYPES.GoogleApiCache)
  .to(GoogleApiCache)
  .inSingletonScope();

container
  .bind<PsiClient>(CONTAINER_TYPES.PsiClient)
  .to(PsiClient)
  .inSingletonScope();

container
  .bind<CruxClient>(CONTAINER_TYPES.CruxClient)
  .to(CruxClient)
  .inSingletonScope();

container
  .bind<AuditQueueService>(CONTAINER_TYPES.AuditQueueService)
  .to(AuditQueueService)
  .inSingletonScope();
container
  .bind<IAuditService>(CONTAINER_TYPES.AuditService)
  .to(AuditService)
  .inSingletonScope();
container
  .bind<MailQueueService>(CONTAINER_TYPES.MailQueueService)
  .to(MailQueueService)
  .inSingletonScope();
container
  .bind<IMailProcessor>(CONTAINER_TYPES.MailProcessorService)
  .toDynamicValue(() =>
    createMailProcessor({
      database: container.get<DatabaseType>(CONTAINER_TYPES.Drizzle),
      resendApiKey: env.RESEND_API_KEY,
    })
  )
  .inSingletonScope();
container
  .bind<QueueSignatureService>(CONTAINER_TYPES.QueueSignatureService)
  .to(QueueSignatureService)
  .inSingletonScope();

// cron jobs
container.bind<AuditCronService>(AuditCronService).toSelf().inSingletonScope();

// controllers
container
  .bind<SiteAuditController>(SiteAuditController)
  .toSelf()
  .inSingletonScope();
container.bind<MailController>(MailController).toSelf().inSingletonScope();
container
  .bind<ResendMailController>(ResendMailController)
  .toSelf()
  .inSingletonScope();

export { container };
export { CONTAINER_TYPES } from "./container-types";
