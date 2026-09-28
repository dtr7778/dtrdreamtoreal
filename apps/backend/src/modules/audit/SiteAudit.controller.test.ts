import { TestServer } from "@test/core/TestServer";
import { StatusCodes } from "http-status-codes";
import { Container } from "inversify";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import type { AuthType } from "@workspace/auth";
import {
  createMockDrizzleClient,
  type MockDatabaseType,
} from "@workspace/drizzle/client/mock";
import type { IStorageService } from "@workspace/lib/supabase/storage";
import type { ExtendedRedis } from "@workspace/redis/client/ioRedis";
import { createMockRedisClient } from "@workspace/redis/client/ioRedis/mock";
import { IApplication } from "@workspace/server-core/framework";
import { ApiErrorFilter } from "@workspace/server-core/helpers";
import { type IAuditLogService } from "@workspace/server-core/services";

import { API_MESSAGE } from "@/constant";
import { CONTAINER_TYPES } from "@/container/container-types";
import { AuthMiddleware } from "@/middlewares/auth.middleware";
import { SiteAuditController } from "@/modules/audit/SiteAudit.controller";

import { type IAuditService } from "./Audit.service";

describe("SiteAuditController (Integration)", () => {
  let app: IApplication;
  let db: MockDatabaseType;

  beforeAll(async () => {
    db = await createMockDrizzleClient();

    const container = new Container();

    container
      .bind<ApiErrorFilter>(ApiErrorFilter)
      .to(ApiErrorFilter)
      .inSingletonScope();

    container
      .bind<MockDatabaseType>(CONTAINER_TYPES.Drizzle)
      .toDynamicValue(() => db)
      .inSingletonScope();
    container
      .bind<ExtendedRedis>(CONTAINER_TYPES.Redis)
      .toDynamicValue(() => createMockRedisClient())
      .inSingletonScope();
    container
      .bind<IStorageService>(CONTAINER_TYPES.Storage)
      .toDynamicValue(
        () =>
          ({
            delete: vi.fn(async () => undefined),
          }) as unknown as IStorageService
      )
      .inSingletonScope();
    container
      .bind<AuthType>(CONTAINER_TYPES.Auth)
      .toDynamicValue(
        () =>
          ({
            api: { getSession: vi.fn(async () => null) },
          }) as unknown as AuthType
      )
      .inSingletonScope();
    container.bind<AuthMiddleware>(AuthMiddleware).toSelf().inSingletonScope();
    container
      .bind<IAuditService>(CONTAINER_TYPES.AuditService)
      .toDynamicValue(
        () =>
          ({
            createSiteAudit: vi.fn(),
            orchestrate: vi.fn(),
            runCheck: vi.fn(),
            storeCwv: vi.fn(),
            getResults: vi.fn(),
            deleteSiteAudit: vi.fn(),
          }) as unknown as IAuditService
      )
      .inSingletonScope();
    container
      .bind<IAuditLogService>(CONTAINER_TYPES.AuditLogService)
      .toDynamicValue(
        () =>
          ({
            publish: vi.fn(),
            getHistory: vi.fn(),
            tail: vi.fn(),
            persistRun: vi.fn(),
          }) as unknown as IAuditLogService
      )
      .inSingletonScope();
    container
      .bind<SiteAuditController>(SiteAuditController)
      .toSelf()
      .inSingletonScope();

    app = new TestServer(container, [SiteAuditController]).getApp();
  });

  afterAll(async () => {
    await db.$client.close();
  });

  it("list of site audits", async () => {
    const listed = await request(app)
      .get("/api/v1/site-audits")
      .expect(StatusCodes.OK);

    expect(listed.body.message).toBe(API_MESSAGE.SITE_AUDIT.GET_ALL);
    expect(listed.body.data.data).toHaveLength(0);
  });
});
