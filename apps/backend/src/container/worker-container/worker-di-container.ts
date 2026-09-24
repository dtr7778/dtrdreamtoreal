import { Container } from "inversify";

import {
  createDrizzleClient,
  DatabaseType,
} from "@workspace/drizzle/client/ioRedis";
import { logger, LoggerType } from "@workspace/lib/logger";
import { createRedisClient, ExtendedRedis } from "@workspace/lib/redis/ioRedis";
import { createMailProcessor, IMailProcessor } from "@workspace/mail";

import { env } from "@/env";

import { CONTAINER_TYPES } from "@/container/container-types";
import { AuditQueueService } from "@/modules/audit/AuditQueue.service";
import { AuditService, IAuditService } from "@/modules/audit/Audit.service";
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
  .bind<IMailProcessor>(WORKER_CONTAINER_TYPES.MailProcessorService)
  .toDynamicValue(() =>
    createMailProcessor({
      database: container.get<DatabaseType>(WORKER_CONTAINER_TYPES.Drizzle),
      resendApiKey: env.RESEND_API_KEY,
    })
  )
  .inSingletonScope();

// Audit graph. Drizzle/Redis/Logger are bound above under the same
// `Symbol.for(...)` identifiers, so `CONTAINER_TYPES` injections resolve them.
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

export { container };
