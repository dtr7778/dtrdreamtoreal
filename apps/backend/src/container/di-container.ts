import { AuthType, createBullmqBetterAuth } from "@workspace/auth";
import { createSecondaryStorage } from "@workspace/auth/ioRedis-secondary-storage";
import { createDrizzleClient } from "@workspace/drizzle/client/ioRedis";
import type { DatabaseType } from "@workspace/drizzle/types";
import { type BullmqEnqueueResult } from "@workspace/lib/bullmq";
import { logger, type LoggerType } from "@workspace/lib/logger";
import { container, LoggerInterceptor } from "@workspace/lib/server";
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
} from "@workspace/redis/client/ioRedis";

import { AuthGuard } from "@/guard/auth.guard";
import { BullmqSignatureGuard } from "@/guard/bullmq-signature.guard";
import { PermissionGuard } from "@/guard/permission.guard";
import { ResendWebhookGuard } from "@/guard/resend-webhook.guard";
import {
  AuthMiddleware,
  RolePermissionMiddleware,
} from "@/middlewares/auth.middleware";
import { AuditService, IAuditService } from "@/modules/audit/Audit.service";
import { AuditCronService } from "@/modules/audit/AuditCron.service";
import {
  AuditLogService,
  IAuditLogService,
} from "@/modules/audit/AuditLog.service";
import { AuditQueueService } from "@/modules/audit/AuditQueue.service";
import { CruxClient } from "@/modules/audit/clients/crux.client";
import { GoogleApiCache } from "@/modules/audit/clients/google-cache";
import { PsiClient } from "@/modules/audit/clients/psi.client";
import { MailController } from "@/modules/mail/Mail.controller";
import { MailService } from "@/modules/mail/Mail.service";
import { MailQueueService } from "@/modules/mail/MailQueue.service";
import { ResendMailController } from "@/modules/mail/ResendMail.controller";

import { env } from "../env";
import { SiteAuditController } from "../modules/audit/SiteAudit.controller";
import { CONTAINER_TYPES } from "./container-types";

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
  .bind<IAuditLogService>(CONTAINER_TYPES.AuditLogService)
  .to(AuditLogService)
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
  .bind<MailService>(CONTAINER_TYPES.MailService)
  .toDynamicValue(
    () =>
      new MailService(
        container.get<EmailService>(CONTAINER_TYPES.EmailService),
        container.get<EmailThreadService>(CONTAINER_TYPES.EmailThreadService),
        container.get<MailQueueService>(CONTAINER_TYPES.MailQueueService),
        container.get<ExtendedRedis>(CONTAINER_TYPES.Redis),
        {
          appName: env.APP_NAME,
          supportMail: env.SUPPORT_MAIL,
          systemMail: env.SYSTEM_MAIL,
          dedupWindowSeconds: 300,
        }
      )
  )
  .inSingletonScope();
container
  .bind<IBullmqMailService>(CONTAINER_TYPES.Mailer)
  .toDynamicValue(() =>
    createBullmqMail({
      signingSecret: env.BULLMQ_SIGNING_SECRET,
      publisher: {
        async enqueue(request) {
          const mailService = container.get<MailService>(
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
      trustedOrigins: env.CORS_ORIGIN,
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
