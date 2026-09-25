import { Container } from "inversify";

import { createDrizzleClient } from "@workspace/drizzle/client/ioRedis";
import type { DatabaseType } from "@workspace/drizzle/types";
import { logger, LoggerType } from "@workspace/lib/logger";
import { EmailService, EmailThreadService } from "@workspace/mail";
import {
  type IMailTransport,
  ResendMailTransport,
} from "@workspace/mail/transports";
import {
  createRedisClient,
  ExtendedRedis,
} from "@workspace/redis/client/ioRedis";

import { env } from "@/env";
import { AuditService, IAuditService } from "@/modules/audit/Audit.service";
import { AuditQueueService } from "@/modules/audit/AuditQueue.service";
import { CruxClient } from "@/modules/audit/clients/crux.client";
import { GoogleApiCache } from "@/modules/audit/clients/google-cache";
import { PsiClient } from "@/modules/audit/clients/psi.client";

import { WORKER_CONTAINER_TYPES } from "./worker-container-types";

const container = new Container();

container
  .bind<ExtendedRedis>(WORKER_CONTAINER_TYPES.Redis)
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
  .bind<DatabaseType>(WORKER_CONTAINER_TYPES.Drizzle)
  .toDynamicValue(() =>
    createDrizzleClient({
      databaseUrl: env.DATABASE_URL,
      isProd: env.NODE_ENV === "production",
      operationMode: "normal",
      redis: container.get<ExtendedRedis>(WORKER_CONTAINER_TYPES.Redis),
    })
  )
  .inSingletonScope();

container
  .bind<LoggerType>(WORKER_CONTAINER_TYPES.Logger)
  .toDynamicValue(() =>
    logger({
      serviceName: "backend worker",
      logLevel: env.API_LOG_LEVEL,
    })
  )
  .inRequestScope();

container
  .bind<EmailService>(WORKER_CONTAINER_TYPES.EmailService)
  .toConstantValue(
    new EmailService(
      container.get<DatabaseType>(WORKER_CONTAINER_TYPES.Drizzle)
    )
  );
container
  .bind<EmailThreadService>(WORKER_CONTAINER_TYPES.EmailThreadService)
  .toConstantValue(
    new EmailThreadService(
      container.get<DatabaseType>(WORKER_CONTAINER_TYPES.Drizzle)
    )
  );
container
  .bind<GoogleApiCache>(WORKER_CONTAINER_TYPES.GoogleApiCache)
  .to(GoogleApiCache)
  .inSingletonScope();

container
  .bind<PsiClient>(WORKER_CONTAINER_TYPES.PsiClient)
  .to(PsiClient)
  .inSingletonScope();

container
  .bind<CruxClient>(WORKER_CONTAINER_TYPES.CruxClient)
  .to(CruxClient)
  .inSingletonScope();

container
  .bind<AuditQueueService>(WORKER_CONTAINER_TYPES.AuditQueueService)
  .to(AuditQueueService)
  .inSingletonScope();
container
  .bind<IAuditService>(WORKER_CONTAINER_TYPES.AuditService)
  .to(AuditService)
  .inSingletonScope();

container
  .bind<IMailTransport>(WORKER_CONTAINER_TYPES.ResendMailTransport)
  .toConstantValue(new ResendMailTransport(env.RESEND_API_KEY));

export { container };
