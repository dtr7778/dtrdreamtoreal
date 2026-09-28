import { and, asc, eq, gt } from "drizzle-orm";
import { injectable } from "inversify";
import z from "zod";

import {
  type AuditLogDataModel,
  AuditLogTable,
  type InsertAuditLog,
} from "@workspace/drizzle/schemas";
import type { DatabaseType } from "@workspace/drizzle/types";
import {
  AuditLogEventTypeEnumSchema,
  AuditLogLevelEnumSchema,
} from "@workspace/drizzle/zod-db-enums";
import type { ExtendedRedis } from "@workspace/redis/client/ioRedis";

export const AUDIT_REDIS_KEYS = {
  logStream: (siteAuditId: string) => `audit:log:${siteAuditId}`,
  logSequence: (siteAuditId: string) => `audit:log:${siteAuditId}:sequence`,
} as const;

export const AUDIT_LOG_DEFAULTS = {
  logStreamMaxLen: 5000,
  logStreamTtlSeconds: 60 * 60 * 24,
} as const;

/** Event types that mark the end of a run's live log stream. */
export const AUDIT_LOG_TERMINAL_EVENTS = [
  "run_completed",
  "run_failed",
] as const;

export const auditLogEventSchema = z.object({
  /** Monotonic per-run sequence, also used as the SSE `id`. */
  sequence: z.number().int().nonnegative(),
  siteAuditId: z.uuid(),
  type: AuditLogEventTypeEnumSchema,
  level: AuditLogLevelEnumSchema,
  message: z.string(),
  data: z.record(z.string(), z.unknown()).nullable(),
  timestamp: z.string(),
});

export type AuditLogEvent = z.infer<typeof auditLogEventSchema>;
export type AuditLogEventType = AuditLogEvent["type"];
export type AuditLogLevel = AuditLogEvent["level"];
export type AuditLogEventData = NonNullable<AuditLogEvent["data"]>;

/** Payload accepted by {@link AuditLogService.publish}; the service fills the rest. */
export interface AuditLogEventInput {
  type: AuditLogEventType;
  message: string;
  level?: AuditLogLevel;
  data?: AuditLogEventData;
}

export function isTerminalAuditLogEvent(type: AuditLogEventType): boolean {
  return (AUDIT_LOG_TERMINAL_EVENTS as readonly string[]).includes(type);
}

export type AuditLogHistorySource = "redis" | "database";

export interface AuditLogHistory {
  source: AuditLogHistorySource;
  events: AuditLogEvent[];
}

export interface IAuditLogService {
  /** Append an event to the run's Redis stream and return the stored event. */
  publish(
    siteAuditId: string,
    event: AuditLogEventInput
  ): Promise<AuditLogEvent>;
  /**
   * Read events for a run. Prefers the persisted database rows; falls back to
   * the live Redis stream while the run is still in progress.
   */
  getHistory(
    siteAuditId: string,
    afterSequence?: number
  ): Promise<AuditLogHistory>;
  /**
   * Live-tail the run's Redis stream, yielding events with a sequence greater
   * than `afterSequence` until a terminal event, abort, or the stream expires.
   */
  tail(
    siteAuditId: string,
    options: { afterSequence?: number; signal?: AbortSignal }
  ): AsyncGenerator<AuditLogEvent>;
  /** Flush the Redis stream into PostgreSQL and set a retention TTL. */
  persistRun(siteAuditId: string): Promise<number>;
}

type RedisStreamEntry = [id: string, fields: string[]];
type RedisStreamResult = Array<[stream: string, entries: RedisStreamEntry[]]>;

@injectable()
export class AuditLogService implements IAuditLogService {
  constructor(
    private readonly db: DatabaseType,
    private readonly redis: ExtendedRedis
  ) {}

  public async publish(
    siteAuditId: string,
    event: AuditLogEventInput
  ): Promise<AuditLogEvent> {
    const streamKey = AUDIT_REDIS_KEYS.logStream(siteAuditId);
    const sequenceKey = AUDIT_REDIS_KEYS.logSequence(siteAuditId);

    const sequence = await this.redis.incr(sequenceKey);
    const stored: AuditLogEvent = {
      sequence,
      siteAuditId,
      type: event.type,
      level: event.level ?? "info",
      message: event.message,
      data: event.data ?? null,
      timestamp: new Date().toISOString(),
    };

    await this.redis.xadd(
      streamKey,
      "MAXLEN",
      "~",
      String(AUDIT_LOG_DEFAULTS.logStreamMaxLen),
      "*",
      "event",
      JSON.stringify(stored)
    );

    await Promise.all([
      this.redis.expire(streamKey, AUDIT_LOG_DEFAULTS.logStreamTtlSeconds),
      this.redis.expire(sequenceKey, AUDIT_LOG_DEFAULTS.logStreamTtlSeconds),
    ]);

    return stored;
  }

  public async getHistory(
    siteAuditId: string,
    afterSequence = 0
  ): Promise<AuditLogHistory> {
    const persisted = await this.getPersistedEvents(siteAuditId, afterSequence);
    if (persisted.length > 0) {
      return { source: "database", events: persisted };
    }

    const streamed = await this.getStreamEvents(siteAuditId, afterSequence);
    return { source: "redis", events: streamed };
  }

  public async *tail(
    siteAuditId: string,
    options: { afterSequence?: number; signal?: AbortSignal }
  ): AsyncGenerator<AuditLogEvent> {
    const afterSequence = options.afterSequence ?? 0;
    const streamKey = AUDIT_REDIS_KEYS.logStream(siteAuditId);
    const subscriber = this.redis.duplicate();

    let lastId = "0-0";

    try {
      const existing = await subscriber.xrange(streamKey, "-", "+");
      const existingEvents: AuditLogEvent[] = [];
      for (const entry of existing as RedisStreamEntry[]) {
        lastId = entry[0];
        const event = parseStreamEntry(entry);
        if (!event || event.sequence <= afterSequence) continue;
        existingEvents.push(event);
      }

      existingEvents.sort((a, b) => a.sequence - b.sequence);
      for (const event of existingEvents) {
        yield event;
        if (isTerminalAuditLogEvent(event.type)) return;
      }

      while (!options.signal?.aborted) {
        const result = (await subscriber.xread(
          "BLOCK",
          2000,
          "STREAMS",
          streamKey,
          lastId
        )) as RedisStreamResult | null;

        if (!result) {
          const exists = await subscriber.exists(streamKey);
          if (exists === 0) return;
          continue;
        }

        for (const [, entries] of result) {
          const batch: AuditLogEvent[] = [];
          for (const entry of entries) {
            lastId = entry[0];
            const event = parseStreamEntry(entry);
            if (!event || event.sequence <= afterSequence) continue;
            batch.push(event);
          }

          // Sequence is assigned before the XADD, so concurrent appends can
          // land out of order. Sort each batch before yielding.
          batch.sort((a, b) => a.sequence - b.sequence);
          for (const event of batch) {
            yield event;
            if (isTerminalAuditLogEvent(event.type)) return;
          }
        }
      }
    } finally {
      await subscriber.quit();
    }
  }

  public async persistRun(siteAuditId: string): Promise<number> {
    const streamKey = AUDIT_REDIS_KEYS.logStream(siteAuditId);
    const sequenceKey = AUDIT_REDIS_KEYS.logSequence(siteAuditId);

    const entries = (await this.redis.xrange(
      streamKey,
      "-",
      "+"
    )) as RedisStreamEntry[];

    const values = entries
      .map(parseStreamEntry)
      .filter((event): event is AuditLogEvent => event !== null)
      .map(
        (event) =>
          ({
            siteAuditId,
            sequence: event.sequence,
            type: event.type,
            level: event.level,
            message: event.message,
            data: event.data ?? null,
            createdAt: new Date(event.timestamp),
          }) satisfies InsertAuditLog
      );

    if (values.length > 0) {
      await this.db
        .insert(AuditLogTable)
        .values(values)
        .onConflictDoNothing({
          target: [AuditLogTable.siteAuditId, AuditLogTable.sequence],
        });
    }

    // Keep the stream around for the retention window so live tails can still
    // read the terminal event, then let it expire.
    await Promise.all([
      this.redis.expire(streamKey, AUDIT_LOG_DEFAULTS.logStreamTtlSeconds),
      this.redis.expire(sequenceKey, AUDIT_LOG_DEFAULTS.logStreamTtlSeconds),
    ]);

    return values.length;
  }

  private async getPersistedEvents(
    siteAuditId: string,
    afterSequence: number
  ): Promise<AuditLogEvent[]> {
    const rows = await this.db
      .select()
      .from(AuditLogTable)
      .where(
        and(
          eq(AuditLogTable.siteAuditId, siteAuditId),
          gt(AuditLogTable.sequence, afterSequence)
        )
      )
      .orderBy(asc(AuditLogTable.sequence));

    return rows.map(rowToEvent);
  }

  private async getStreamEvents(
    siteAuditId: string,
    afterSequence: number
  ): Promise<AuditLogEvent[]> {
    const entries = (await this.redis.xrange(
      AUDIT_REDIS_KEYS.logStream(siteAuditId),
      "-",
      "+"
    )) as RedisStreamEntry[];

    return entries
      .map(parseStreamEntry)
      .filter(
        (event): event is AuditLogEvent =>
          event !== null && event.sequence > afterSequence
      )
      .sort((a, b) => a.sequence - b.sequence);
  }
}

function parseStreamEntry(entry: RedisStreamEntry): AuditLogEvent | null {
  const [, fields] = entry;
  const rawIndex = fields.indexOf("event");
  const raw = rawIndex >= 0 ? fields[rawIndex + 1] : undefined;
  if (!raw) return null;

  try {
    const parsed = auditLogEventSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function rowToEvent(row: AuditLogDataModel): AuditLogEvent {
  return {
    sequence: row.sequence,
    siteAuditId: row.siteAuditId,
    type: row.type,
    level: row.level,
    message: row.message,
    data: row.data ?? null,
    timestamp: row.createdAt.toISOString(),
  };
}
