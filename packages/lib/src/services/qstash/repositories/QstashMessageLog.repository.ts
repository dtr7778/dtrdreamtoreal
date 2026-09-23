import { type ExtendedRedis, HashSerializer } from "../../redis";
import { QSTASH_KEY_PREFIX, QSTASH_TTL_SECONDS } from "../constants";
import type { ContentType, QstashMessageLog } from "../types";

/**
 * Redis-backed persistence for message logs.
 *
 * Each message is stored as two keys:
 * - `qstash:log:<messageId>`  – the serialized {@link QstashMessageLog} hash.
 * - `qstash:body:<messageId>` – the raw body, kept so the message can be
 *   replayed on retry.
 */
export class QstashMessageLogRepository {
  constructor(private readonly redis: ExtendedRedis) {}

  /** Redis key holding the log hash for `messageId`. */
  public logKey(messageId: string): string {
    return `${QSTASH_KEY_PREFIX.log}:${messageId}`;
  }

  /** Redis key holding the stored body for `messageId`. */
  public bodyKey(messageId: string): string {
    return `${QSTASH_KEY_PREFIX.body}:${messageId}`;
  }

  /** Persist a log entry together with its body, refreshing their TTLs. */
  public async store<T>(entry: QstashMessageLog, body: T): Promise<void> {
    const logKey = this.logKey(entry.messageId);
    const bodyKey = this.bodyKey(entry.messageId);
    const serialized = HashSerializer.serialize(entry);
    const bodyStr =
      entry.contentType === "json" ? JSON.stringify(body) : String(body);

    await this.redis.hset(logKey, serialized);
    await this.redis.expire(logKey, QSTASH_TTL_SECONDS.log);
    await this.redis.set(bodyKey, bodyStr, { ex: QSTASH_TTL_SECONDS.body });
  }

  /** Read the log for `messageId`, or `null` when it does not exist. */
  public async fetch(messageId: string): Promise<QstashMessageLog | null> {
    const data = await this.redis.hgetall(this.logKey(messageId));
    if (!data || !data.messageId) return null;
    return HashSerializer.deserialize<QstashMessageLog>(data);
  }

  /**
   * Read the stored body for `messageId`, decoding JSON when the message was
   * published with `contentType: "json"`. Returns `null` when missing or when
   * JSON decoding fails.
   */
  public async fetchBody<T>(
    messageId: string,
    contentType: ContentType
  ): Promise<T | null> {
    const raw = await this.redis.get<string>(this.bodyKey(messageId));
    if (!raw) return null;
    if (contentType === "json") {
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    }
    return raw as T;
  }

  /** Apply a partial update to a log, refreshing its TTL. */
  public async update(
    messageId: string,
    updates: Partial<QstashMessageLog>
  ): Promise<void> {
    const key = this.logKey(messageId);
    const fields = HashSerializer.serialize(updates);
    if (Object.keys(fields).length === 0) return;

    await this.redis.hset(key, fields);
    await this.redis.expire(key, QSTASH_TTL_SECONDS.log);
  }

  /** Delete both the log and its body. */
  public async remove(messageId: string): Promise<void> {
    await this.redis.del(this.logKey(messageId), this.bodyKey(messageId));
  }

  /**
   * List every log key currently stored.
   *
   * Note: uses the `KEYS` command which is O(N) over the keyspace. For
   * large-scale production use, consider replacing this with a cursor-based
   * `SCAN`.
   */
  public async listAllKeys(): Promise<string[]> {
    return this.redis.keys(`${this.logKey("*")}`);
  }
}
