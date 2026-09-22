import type { ExtendedRedis } from "../../redis";
import { QSTASH_KEY_PREFIX } from "../constants";

/**
 * Redis-backed index of dead-lettered messages.
 *
 * Keeps two structures in sync:
 * - a set of message ids (`qstash:dlq`) for O(1) membership checks.
 * - a sorted set (`qstash:dlq:sorted`) scored by insertion time so the DLQ can
 *   be listed newest-first.
 */
export class QstashDeadLetterRepository {
  constructor(private readonly redis: ExtendedRedis) {}

  /** Redis set key holding all dead-letter message ids. */
  public dlqSetKey(): string {
    return QSTASH_KEY_PREFIX.deadLetterSet;
  }

  /** Redis sorted set key ordering dead-letter ids by insertion time. */
  public dlqSortedKey(): string {
    return QSTASH_KEY_PREFIX.deadLetterSorted;
  }

  /** Add a message to the dead letter index. */
  public async add(messageId: string): Promise<void> {
    await this.redis.sadd(this.dlqSetKey(), messageId);
    await this.redis.zadd(this.dlqSortedKey(), {
      score: Date.now(),
      member: messageId,
    });
  }

  /** Remove a message from the dead letter index. */
  public async remove(messageId: string): Promise<void> {
    await this.redis.srem(this.dlqSetKey(), messageId);
    await this.redis.zrem(this.dlqSortedKey(), messageId);
  }

  /** List the newest dead-letter ids, up to `limit`. */
  public async listIds(limit: number): Promise<string[]> {
    return this.redis.zrange<string[]>(this.dlqSortedKey(), 0, limit - 1, {
      rev: true,
    });
  }
}
