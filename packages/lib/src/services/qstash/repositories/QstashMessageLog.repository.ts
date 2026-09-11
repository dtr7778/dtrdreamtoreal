import { ExtendedRedis, HashSerializer } from "../../redis";

export type ContentType = "json" | "text";

export type QstashMessageState =
  | "pending"
  | "delivered"
  | "failed"
  | "retrying"
  | "dead_letter";

export interface QstashMessageLog {
  messageId: string;
  deduplicationId: string;
  state: QstashMessageState;
  retried: number;
  maxRetries: number;
  url: string;
  callback: string | null;
  failureCallback: string | null;
  isDeadLetter: boolean;
  contentType: ContentType;
  deliveredAt: number | null;
  createdAt: number;
  scheduledAt: number | null;
}

const TTL_SECONDS = {
  log: 86_400 * 7,
  body: 86_400 * 7,
} as const;

export class QstashMessageLogRepository {
  constructor(private readonly redis: ExtendedRedis) {}

  public logKey(messageId: string) {
    return `qstash:log:${messageId}`;
  }
  public bodyKey(messageId: string) {
    return `qstash:body:${messageId}`;
  }

  async store(entry: QstashMessageLog, body: unknown): Promise<void> {
    const logKey = this.logKey(entry.messageId);
    const bodyKey = this.bodyKey(entry.messageId);
    const serialized = HashSerializer.serialize(entry);
    const bodyStr =
      entry.contentType === "json" ? JSON.stringify(body) : String(body);

    await this.redis.hset(logKey, serialized);
    await this.redis.expire(logKey, TTL_SECONDS.log);
    await this.redis.set(bodyKey, bodyStr, { ex: TTL_SECONDS.body });
  }

  async fetch(messageId: string): Promise<QstashMessageLog | null> {
    const data = await this.redis.hgetall(this.logKey(messageId));
    if (!data || !data.messageId) return null;
    return HashSerializer.deserialize<QstashMessageLog>(data);
  }

  async fetchBody<T>(
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

  async update(
    messageId: string,
    updates: Partial<QstashMessageLog>
  ): Promise<void> {
    const key = this.logKey(messageId);
    const fields = HashSerializer.serialize(updates);
    if (Object.keys(fields).length === 0) return;

    await this.redis.hset(key, fields);
    await this.redis.expire(key, TTL_SECONDS.log);
  }

  async remove(messageId: string): Promise<void> {
    await this.redis.del(this.logKey(messageId), this.bodyKey(messageId));
  }

  /**
   * Note: uses the KEYS command which is O(N) over the keyspace.
   * For large-scale production use, consider replacing with SCAN.
   */
  async listAllKeys(): Promise<string[]> {
    return this.redis.keys(`${this.logKey("*")}`);
  }
}
