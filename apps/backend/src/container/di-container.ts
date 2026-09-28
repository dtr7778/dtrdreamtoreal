import { Container } from "inversify";

import { AuthType, createBullmqBetterAuth } from "@workspace/auth";
import { createSecondaryStorage } from "@workspace/auth/ioRedis-secondary-storage";
import { createDrizzleClient } from "@workspace/drizzle/client/ioRedis";
import type { DatabaseType } from "@workspace/drizzle/types";
import { type BullmqEnqueueResult } from "@workspace/lib/bullmq";
import {
  createServerClient,
  type ServerSupabaseClient,
} from "@workspace/lib/supabase/server-client";
import {
  createStorage,
  type IStorageService,
} from "@workspace/lib/supabase/storage";
import { expandTrustedOrigins } from "@workspace/lib/utils";
import {
  createBullmqMail,
  EmailService,
  EmailThreadService,
  type IBullmqMailService,
  RawMailPayload,
  TemplateMailPayload,
} from "@workspace/mail";
import {
  createRedisClient,
  ExtendedRedis,
  resolveRedisTls,
} from "@workspace/redis/client/ioRedis";
import { LoggerInterceptor } from "@workspace/server-core/framework";
import { AuthGuard, PermissionGuard } from "@workspace/server-core/guard";
import { ApiErrorFilter } from "@workspace/server-core/helpers";
import {
  AuditLogService,
  type IAuditLogService,
} from "@workspace/server-core/services";

import { env } from "@/env";
import { BullmqSignatureGuard } from "@/guards/bullmq-signature.guard";
import { ResendWebhookGuard } from "@/guards/resend-webhook.guard";
import {
  AuthMiddleware,
  RolePermissionMiddleware,
} from "@/middlewares/auth.middleware";
import { AuditService, IAuditService } from "@/modules/audit/Audit.service";
import {
  AuditQueueService,
  type IAuditQueueService,
} from "@/modules/audit/AuditQueue.service";
import {
  ISiteAuditController,
  SiteAuditController,
} from "@/modules/audit/SiteAudit.controller";
import {
  IMailController,
  MailController,
} from "@/modules/mail/Mail.controller";
import { IMailService, MailService } from "@/modules/mail/Mail.service";
import {
  IMailQueueService,
  MailQueueService,
} from "@/modules/mail/MailQueue.service";
import {
  IResendMailController,
  ResendMailController,
} from "@/modules/mail/ResendMail.controller";

import { CONTAINER_TYPES } from "./container-types";

const container = new Container();

container
  .bind<ApiErrorFilter>(ApiErrorFilter)
  .to(ApiErrorFilter)
  .inSingletonScope();

container.bind<LoggerInterceptor>(LoggerInterceptor).toConstantValue(
  new LoggerInterceptor({
    serviceName: "Backend",
    logLevel: env.API_LOG_LEVEL,
  })
);
container
  .bind<ExtendedRedis>(CONTAINER_TYPES.Redis)
  .toDynamicValue(() =>
    createRedisClient({
      url: env.REDIS_URL,
      tls: resolveRedisTls(env.REDIS_URL, env.REDIS_TLS),
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
  .bind<EmailService>(CONTAINER_TYPES.EmailService)
  .toConstantValue(
    new EmailService(container.get<DatabaseType>(CONTAINER_TYPES.Drizzle))
  );
container
  .bind<EmailThreadService>(CONTAINER_TYPES.EmailThreadService)
  .toConstantValue(
    new EmailThreadService(container.get<DatabaseType>(CONTAINER_TYPES.Drizzle))
  );

container
  .bind<IAuditQueueService>(CONTAINER_TYPES.AuditQueueService)
  .to(AuditQueueService)
  .inSingletonScope();
container
  .bind<IAuditLogService>(CONTAINER_TYPES.AuditLogService)
  .toConstantValue(
    new AuditLogService(
      container.get<DatabaseType>(CONTAINER_TYPES.Drizzle),
      container.get<ExtendedRedis>(CONTAINER_TYPES.Redis)
    )
  );
container
  .bind<IAuditService>(CONTAINER_TYPES.AuditService)
  .to(AuditService)
  .inSingletonScope();
container
  .bind<IMailQueueService>(CONTAINER_TYPES.MailQueueService)
  .to(MailQueueService)
  .inSingletonScope();
container
  .bind<IMailService>(CONTAINER_TYPES.MailService)
  .to(MailService)
  .inSingletonScope();
container
  .bind<IBullmqMailService>(CONTAINER_TYPES.Mailer)
  .toDynamicValue(() =>
    createBullmqMail({
      signingSecret: env.BULLMQ_SIGNING_SECRET,
      publisher: {
        async enqueue(request) {
          const mailService = container.get<IMailService>(
            CONTAINER_TYPES.MailService
          );

          const result =
            request.job === "sendRaw"
              ? await mailService.sendRaw(request.payload as RawMailPayload)
              : await mailService.send(request.payload as TemplateMailPayload);

          return {
            messageId: result.jobId,
            queue: result.queue,
          } satisfies BullmqEnqueueResult;
        },
        async enqueueBatch(request) {
          const mailService = container.get<MailService>(
            CONTAINER_TYPES.MailService
          );

          const results =
            request.job === "sendRawBatch"
              ? await mailService.sendRawBatch(
                  request.payloads as RawMailPayload[]
                )
              : await mailService.sendBatch(
                  request.payloads as TemplateMailPayload[]
                );

          return results.map((result) => ({
            success: result.success,
            messageId: result.jobId,
            queue: result.queue,
            error: result.error,
          }));
        },
      },
      defaultRetries: 3,
    })
  )
  .inSingletonScope();
container
  .bind<AuthType>(CONTAINER_TYPES.Auth)
  .toDynamicValue(() =>
    createBullmqBetterAuth({
      baseURL: env.BETTER_AUTH_URL,
      secret: env.BETTER_AUTH_SECRET,
      appName: env.APP_NAME,
      siteUrl: env.SITE_URL,
      isDev: env.NODE_ENV !== "production",
      trustedOrigins: expandTrustedOrigins(env.CORS_ORIGIN),
      domainName: env.DOMAIN_NAME,
      errorPagePath: "/error",
      database: container.get<DatabaseType>(CONTAINER_TYPES.Drizzle),
      secondaryStorage: createSecondaryStorage(
        container.get<ExtendedRedis>(CONTAINER_TYPES.Redis)
      ),
      mailer: container.get<IBullmqMailService>(CONTAINER_TYPES.Mailer),
      google: {
        clientId: env.GOOGLE_AUTH_CLIENT_ID,
        clientSecret: env.GOOGLE_AUTH_CLIENT_SECRET,
        redirectURI: `${env.SITE_URL}/api/auth/callback/google`,
      },
    })
  )
  .inSingletonScope();

container.bind(AuthMiddleware).toSelf().inSingletonScope();
container.bind(RolePermissionMiddleware).toSelf().inSingletonScope();
container.bind(AuthGuard).toSelf().inSingletonScope();
container.bind(PermissionGuard).toSelf().inSingletonScope();
container.bind(BullmqSignatureGuard).toSelf().inSingletonScope();
container.bind(ResendWebhookGuard).toSelf().inSingletonScope();

// controllers
container
  .bind<ISiteAuditController>(SiteAuditController)
  .toSelf()
  .inSingletonScope();
container.bind<IMailController>(MailController).toSelf().inSingletonScope();
container
  .bind<IResendMailController>(ResendMailController)
  .toSelf()
  .inSingletonScope();

export { container };
