import { beforeEach, describe, expect, it } from "vitest";

import {
  createMockDrizzleClient,
  type MockDatabaseType,
} from "@workspace/drizzle/client/mock";
import {
  AuditLogTable,
  CompanyTable,
  SiteAuditTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import { DatabaseType } from "@workspace/drizzle/types";
import { type ExtendedRedis } from "@workspace/redis/client/ioRedis";
import { createMockRedisClient } from "@workspace/redis/client/ioRedis/mock";

import {
  AuditLogService,
  type IAuditLogService,
} from "../services/AuditLog.service";

describe("AuditLogService", () => {
  let db: MockDatabaseType;
  let redis: ExtendedRedis;
  let service: IAuditLogService;
  let siteAuditId: string;

  beforeEach(async () => {
    db = await createMockDrizzleClient();
    redis = createMockRedisClient();
    service = new AuditLogService(db as unknown as DatabaseType, redis);

    const [user] = await db
      .insert(UserTable)
      .values({ name: "Auditor", email: "auditor@example.com", role: "ADMIN" })
      .returning();

    // The legacy `siteAudit_triggerdBy_fkey` constraint incorrectly references
    // users(id) from company_id, so reuse the user id for the company row.
    const [company] = await db
      .insert(CompanyTable)
      .values({ id: user!.id, name: "Acme", createdBy: user!.id })
      .returning();

    const [siteAudit] = await db
      .insert(SiteAuditTable)
      .values({
        companyId: company!.id,
        name: "Acme site",
        url: "https://example.com",
      })
      .returning();

    siteAuditId = siteAudit!.id;
  });

  it("publishes events with an increasing sequence and reads them back", async () => {
    const first = await service.publish(siteAuditId, {
      type: "run_started",
      message: "run started",
      data: { url: "https://example.com" },
    });
    const second = await service.publish(siteAuditId, {
      type: "check_finished",
      level: "warn",
      message: "check finished",
    });

    expect(first.sequence).toBe(1);
    expect(second.sequence).toBe(2);

    const history = await service.getHistory(siteAuditId);
    expect(history.source).toBe("redis");
    expect(history.events.map((event) => event.sequence)).toEqual([1, 2]);
    expect(history.events[1]).toMatchObject({
      type: "check_finished",
      level: "warn",
      message: "check finished",
      siteAuditId,
    });
  });

  it("filters history after a given sequence", async () => {
    await service.publish(siteAuditId, { type: "run_started", message: "a" });
    await service.publish(siteAuditId, { type: "progress", message: "b" });
    await service.publish(siteAuditId, { type: "progress", message: "c" });

    const history = await service.getHistory(siteAuditId, 1);
    expect(history.events.map((event) => event.sequence)).toEqual([2, 3]);
  });

  it("persists the stream to PostgreSQL and prefers persisted rows", async () => {
    await service.publish(siteAuditId, { type: "run_started", message: "a" });
    await service.publish(siteAuditId, {
      type: "run_completed",
      message: "done",
      data: { passed: 1 },
    });

    const persisted = await service.persistRun(siteAuditId);
    expect(persisted).toBe(2);

    const rows = await db.select().from(AuditLogTable);
    expect(rows).toHaveLength(2);
    expect(rows[1]!.type).toBe("run_completed");
    expect(rows[1]!.data).toEqual({ passed: 1 });

    const history = await service.getHistory(siteAuditId);
    expect(history.source).toBe("database");
    expect(history.events.map((event) => event.type)).toEqual([
      "run_started",
      "run_completed",
    ]);
  });

  it("is idempotent when persisting the same run twice", async () => {
    await service.publish(siteAuditId, { type: "run_started", message: "a" });

    await service.persistRun(siteAuditId);
    await service.persistRun(siteAuditId);

    const rows = await db.select().from(AuditLogTable);
    expect(rows).toHaveLength(1);
  });

  it("tails history and stops after a terminal event", async () => {
    await service.publish(siteAuditId, { type: "run_started", message: "a" });
    await service.publish(siteAuditId, { type: "progress", message: "b" });
    await service.publish(siteAuditId, {
      type: "run_completed",
      message: "done",
    });

    const received: number[] = [];
    for await (const event of service.tail(siteAuditId, {})) {
      received.push(event.sequence);
    }

    expect(received).toEqual([1, 2, 3]);
  });
});
