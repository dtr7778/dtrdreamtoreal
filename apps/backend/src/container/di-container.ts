import { Container } from "inversify";

import { createDrizzleClient, DatabaseType } from "@workspace/drizzle/client";
import { logger, type LoggerType } from "@workspace/lib/logger";
import { createRedisClient, ExtendedRedis } from "@workspace/lib/redis";
import { ApiErrorFilter } from "@workspace/lib/server";

import { UserCronService } from "@/modules/user/UserCron.service";

import { env } from "../env";
import { UserController } from "../modules/user/User.controller";
import { CONTAINER_TYPES } from "./container-types";

const container = new Container();

container
  .bind<DatabaseType>(CONTAINER_TYPES.Drizzle)
  .toDynamicValue(() =>
    createDrizzleClient({
      databaseUrl: env.DATABASE_URL,
      isProd: env.NODE_ENV === "production",
      operationMode: "normal",
      redisUrl: env.REDIS_REST_URL,
      redisToken: env.REDIS_REST_TOKEN,
    })
  )
  .inSingletonScope();
container
  .bind<ExtendedRedis>(CONTAINER_TYPES.Redis)
  .toDynamicValue(() =>
    createRedisClient({
      url: env.REDIS_REST_URL,
      token: env.REDIS_REST_TOKEN,
    })
  )
  .inSingletonScope();
container
  .bind<ApiErrorFilter>(ApiErrorFilter)
  .to(ApiErrorFilter)
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

// cron jobs
container.bind<UserCronService>(UserCronService).toSelf().inSingletonScope();

// controllers
container.bind<UserController>(UserController).toSelf().inSingletonScope();

export { container };
export { CONTAINER_TYPES } from "./container-types";
