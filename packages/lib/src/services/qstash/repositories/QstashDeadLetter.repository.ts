import type { ExtendedRedis } from "../../redis";
import { QSTASH_KEY_PREFIX, QSTASH_TTL_SECONDS } from "../constants";

/**
 * Redis-backed index of dead-lettered messages.
 *
 * Keeps two structures in sync:
 * - a set of message ids (`qstash:dlq`) for O(1) membership checks.
 * - a sorted set (`qstash:dlq:sorted`) scored by insertion time so the DLQ can
 *   be listed newest-first.
 *
 * Both keys carry the same TTL as the message logs they reference (refreshed on
 * every {@link add}); ids whose log has already expired are pruned lazily when
 * listing. This keeps the index from accumulating entries that no longer
 * resolve while preserving O(log n) newest-first listing.
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

  /** Add a message to the dead letter index, refreshing the index TTL. */
  public async add(messageId: string): Promise<void> {
    await this.redis.sadd(this.dlqSetKey(), messageId);
    await this.redis.zadd(this.dlqSortedKey(), {
      score: Date.now(),
      member: messageId,
    });
    await this.redis.expire(this.dlqSetKey(), QSTASH_TTL_SECONDS.deadLetter);
    await this.redis.expire(
      this.dlqSortedKey(),
      QSTASH_TTL_SECONDS.deadLetter
    );
  }

  /** Remove a message from the dead letter index. */
  public async remove(messageId: string): Promise<void> {
    await this.redis.srem(this.dlqSetKey(), messageId);
    await this.redis.zrem(this.dlqSortedKey(), messageId);
  }

  /**
   * Remove several messages from the dead letter index in one round trip.
   *
   * Used to prune ids whose backing log has expired or been cleared, keeping
   * the index from accumulating entries that no longer resolve.
   */
  public async removeMany(messageIds: string[]): Promise<void> {
    if (messageIds.length === 0) return;

    await this.redis.srem(this.dlqSetKey(), ...messageIds);
    await this.redis.zrem(this.dlqSortedKey(), ...messageIds);
  }

  /** List the newest dead-letter ids, up to `limit`. */
  public async listIds(limit: number): Promise<string[]> {
    return this.redis.zrange<string[]>(this.dlqSortedKey(), 0, limit - 1, {
      rev: true,
    });
  }
}
