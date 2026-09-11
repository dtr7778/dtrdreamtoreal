import { ExtendedRedis } from "../../redis";

export class QstashDeadLetterRepository {
  constructor(private readonly redis: ExtendedRedis) {}

  public dlqSetKey() {
    return `qstash:dlq`;
  }
  public dlqSortedKey() {
    return `qstash:dlq:sorted`;
  }

  async add(messageId: string): Promise<void> {
    await this.redis.sadd(this.dlqSetKey(), messageId);
    await this.redis.zadd(this.dlqSortedKey(), {
      score: Date.now(),
      member: messageId,
    });
  }

  async remove(messageId: string): Promise<void> {
    await this.redis.srem(this.dlqSetKey(), messageId);
    await this.redis.zrem(this.dlqSortedKey(), messageId);
  }

  async listIds(limit: number): Promise<string[]> {
    return this.redis.zrange<string[]>(this.dlqSortedKey(), 0, limit - 1, {
      rev: true,
    });
  }
}
