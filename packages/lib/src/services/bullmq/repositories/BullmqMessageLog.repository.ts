import type { Job } from "bullmq";

import { HashSerializer } from "../../redis/HashSerializer";
import { type ExtendedRedis } from "../../redis/IoRedis.service";
import { BULLMQ_KEY_PREFIX, BULLMQ_LOG_DEFAULTS } from "../constants";
import type {
  BullmqMessageLog,
  BullmqMessageState,
} from "../message-log.types";

/**
 * Redis-backed persistence for BullMQ message logs.
 *
 * Every job log is stored as a single hash (`bullmq:log:<queueName>:<jobId>`)
 * and indexed in a per-queue sorted set (`bullmq:log:index:<queueName>`) scored
 * by creation time, so logs survive even when BullMQ itself discards the job
 * via `removeOnComplete` / `removeOnFail`.
 *
 * Backed by an ioredis client (`ExtendedIoRedis`).
 */
export class BullmqMessageLogRepository {
  constructor(private readonly redis: ExtendedRedis) {}

  /** Redis key holding the log hash for a job. */
  public logKey(queueName: string, jobId: string): string {
    return `${BULLMQ_KEY_PREFIX.log}:${queueName}:${jobId}`;
  }

  /** Redis sorted set key ordering a queue's job ids by creation time. */
  public indexKey(queueName: string): string {
    return `${BULLMQ_KEY_PREFIX.index}:${queueName}`;
  }

  /** Persist a log entry, refreshing its TTL and adding it to the index. */
  public async store(entry: BullmqMessageLog): Promise<void> {
    const key = this.logKey(entry.queueName, entry.jobId);

    await this.redis.hset(key, HashSerializer.serialize(entry));
    await this.redis.expire(key, BULLMQ_LOG_DEFAULTS.ttlSeconds);

    const indexKey = this.indexKey(entry.queueName);
    await this.redis.zadd(indexKey, entry.createdAt, entry.jobId);
    await this.redis.expire(indexKey, BULLMQ_LOG_DEFAULTS.indexTtlSeconds);
  }

  /**
   * Build a log entry from a BullMQ job and persist it.
   *
   * The caller supplies the queue name (BullMQ does not expose it publicly on
   * `Job`) and the lifecycle `state` it just observed.
   *
   * @throws {Error} when the job has not been assigned an id yet.
   */
  public async storeFromJob(
    job: Job,
    queueName: string,
    state: BullmqMessageState = "waiting"
  ): Promise<BullmqMessageLog> {
    if (job.id === undefined) {
      throw new Error("Cannot log a BullMQ job without an id");
    }

    const entry: BullmqMessageLog = {
      jobId: String(job.id),
      queueName,
      jobName: job.name,
      state,
      attempts: job.attemptsMade,
      maxAttempts: job.opts.attempts ?? 1,
      priority: job.priority || null,
      failedReason: job.failedReason || null,
      isDeadLetter: state === "dead_letter",
      parentKey: job.parentKey ?? null,
      deduplicationId: job.deduplicationId ?? null,
      createdAt: job.timestamp,
      processedAt: job.processedOn ?? null,
      finishedAt: job.finishedOn ?? null,
      scheduledAt: job.delay ? job.timestamp + job.delay : null,
    };

    await this.store(entry);
    return entry;
  }

  /** Read the log for a job, or `null` when it does not exist. */
  public async fetch(
    queueName: string,
    jobId: string
  ): Promise<BullmqMessageLog | null> {
    const data = await this.redis.hgetall(this.logKey(queueName, jobId));
    if (!data || !data.jobId) return null;
    return HashSerializer.deserialize<BullmqMessageLog>(data);
  }

  /** Apply a partial update to a log, refreshing its TTL. */
  public async update(
    queueName: string,
    jobId: string,
    updates: Partial<BullmqMessageLog>
  ): Promise<void> {
    const key = this.logKey(queueName, jobId);
    const fields = HashSerializer.serialize(updates);
    if (Object.keys(fields).length === 0) return;

    await this.redis.hset(key, fields);
    await this.redis.expire(key, BULLMQ_LOG_DEFAULTS.ttlSeconds);
  }

  /** Delete a job's log and remove it from the queue index. */
  public async remove(queueName: string, jobId: string): Promise<void> {
    await this.redis.del(this.logKey(queueName, jobId));
    await this.redis.zrem(this.indexKey(queueName), jobId);
  }

  /** List the newest job ids for a queue, up to `limit`. */
  public async listIds(
    queueName: string,
    limit: number = BULLMQ_LOG_DEFAULTS.listLimit
  ): Promise<string[]> {
    return this.redis.zrange(
      this.indexKey(queueName),
      0,
      String(limit - 1),
      "REV"
    );
  }

  /**
   * List the newest logs for a queue.
   *
   * Index entries whose log has expired are pruned as they are encountered.
   */
  public async listByQueue(
    queueName: string,
    limit: number = BULLMQ_LOG_DEFAULTS.listLimit
  ): Promise<BullmqMessageLog[]> {
    const jobIds = await this.listIds(queueName, limit);
    const logs: BullmqMessageLog[] = [];

    for (const jobId of jobIds) {
      const log = await this.fetch(queueName, jobId);
      if (log) {
        logs.push(log);
      } else {
        await this.redis.zrem(this.indexKey(queueName), jobId);
      }
    }

    return logs;
  }

  /** Count the indexed jobs for a queue. */
  public async count(queueName: string): Promise<number> {
    return this.redis.zcard(this.indexKey(queueName));
  }
}
