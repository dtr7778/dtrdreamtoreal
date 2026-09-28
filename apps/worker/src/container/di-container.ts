import { Container } from "inversify";

import { createDrizzleClient } from "@workspace/drizzle/client/ioRedis";
import type { DatabaseType } from "@workspace/drizzle/types";
import { logger, LoggerType } from "@workspace/lib/logger";
import {
  createServerClient,
  type ServerSupabaseClient,
} from "@workspace/lib/supabase/server-client";
import {
  createStorage,
  type IStorageService,
} from "@workspace/lib/supabase/storage";
import {
  EmailService,
  EmailThreadService,
  IEmailService,
  IEmailThreadService,
} from "@workspace/mail";
import {
  type IMailTransport,
  ResendMailTransport,
} from "@workspace/mail/transports";
import {
  createRedisClient,
  ExtendedRedis,
} from "@workspace/redis/client/ioRedis";
import {
  AuditLogService,
  AuditQueueService,
  IAuditLogService,
  type IAuditQueueService,
} from "@workspace/server-core/services";

import { env } from "@/env";
import {
  AuditService,
  type IAUditService,
} from "@/modules/audit/Audit.service";
import {
  AuditCronService,
  IAuditCronService,
} from "@/modules/audit/AuditCron.service";
import {
  AuditReportService,
  IAuditReportService,
} from "@/modules/audit/AuditReport.service";
import {
  AuditReportQueueService,
  IAuditReportQueueService,
} from "@/modules/audit/AuditReportQueue.service";
import { CruxClient, ICruxClient } from "@/modules/audit/clients/crux.client";
import {
  GoogleApiCache,
  IGoogleApiCache,
} from "@/modules/audit/clients/google-cache";
import { IPsiClient, PsiClient } from "@/modules/audit/clients/psi.client";

import { CONTAINER_TYPES } from "./container-types";

const container = new Container();

container
  .bind<ExtendedRedis>(CONTAINER_TYPES.Redis)
  .toDynamicValue(() =>
    createRedisClient({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      username: env.REDIS_USERNAME,
      password: env.REDIS_PASSWORD,
      tls: {},
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
      serviceName: "backend worker",
      logLevel: env.API_LOG_LEVEL,
    })
  )
  .inRequestScope();

container
  .bind<ServerSupabaseClient>(CONTAINER_TYPES.Supabase)
  .toDynamicValue(() =>
    createServerClient({
      url: env.SUPABASE_URL,
      key: env.SUPABASE_SECRET_KEY,
    })
  )
  .inSingletonScope();
container
  .bind<IStorageService>(CONTAINER_TYPES.Storage)
  .toDynamicValue(() =>
    createStorage({
      supabaseClient: container.get<ServerSupabaseClient>(
        CONTAINER_TYPES.Supabase
      ),
      bucket: env.SUPABASE_STORAGE_BUCKET_NAME,
      bucketIsPublic: true,
    })
  )
  .inSingletonScope();

container
  .bind<IEmailService>(CONTAINER_TYPES.EmailService)
  .toConstantValue(
    new EmailService(container.get<DatabaseType>(CONTAINER_TYPES.Drizzle))
  );
container
  .bind<IEmailThreadService>(CONTAINER_TYPES.EmailThreadService)
  .toConstantValue(
    new EmailThreadService(container.get<DatabaseType>(CONTAINER_TYPES.Drizzle))
  );

container
  .bind<IAuditLogService>(CONTAINER_TYPES.AuditLogService)
  .toConstantValue(
    new AuditLogService(
      container.get<DatabaseType>(CONTAINER_TYPES.Drizzle),
      container.get<ExtendedRedis>(CONTAINER_TYPES.Redis)
    )
  );

container
  .bind<IAuditQueueService>(CONTAINER_TYPES.AuditQueueService)
  .to(AuditQueueService)
  .inSingletonScope();
container
  .bind<IAuditReportQueueService>(CONTAINER_TYPES.AuditReportQueueService)
  .to(AuditReportQueueService)
  .inSingletonScope();

container
  .bind<IGoogleApiCache>(CONTAINER_TYPES.GoogleApiCache)
  .to(GoogleApiCache)
  .inSingletonScope();
container
  .bind<IPsiClient>(CONTAINER_TYPES.PsiClient)
  .to(PsiClient)
  .inSingletonScope();
container
  .bind<ICruxClient>(CONTAINER_TYPES.CruxClient)
  .to(CruxClient)
  .inSingletonScope();

container
  .bind<IAUditService>(CONTAINER_TYPES.AuditService)
  .to(AuditService)
  .inSingletonScope();

container.bind<AuditCronService>(AuditCronService).toSelf().inSingletonScope();
container
  .bind<IAuditCronService>(CONTAINER_TYPES.AuditCronService)
  .to(AuditCronService)
  .inSingletonScope();

container
  .bind<IAuditReportService>(CONTAINER_TYPES.AuditReportService)
  .to(AuditReportService)
  .inSingletonScope();

container
  .bind<IMailTransport>(CONTAINER_TYPES.ResendMailTransport)
  .toConstantValue(new ResendMailTransport(env.RESEND_API_KEY));

export { container };
