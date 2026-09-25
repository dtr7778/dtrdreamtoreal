import { Client, type PublishBatchRequest, Receiver } from "@upstash/qstash";

import { formatError } from "../utils";
import { QSTASH_DEFAULTS } from "./constants";
import { HandlerRegistry } from "./HandlerRegistry";
import {
  buildDedupKey,
  type NormalizedPublishOptions,
  normalizePublishOptions,
  requireLog,
  retryDelayExpression,
  toLogEntry,
  toMessageView,
} from "./helpers";
import { QstashError } from "./QstashError";
import { QstashDeadLetterRepository } from "./repositories/QstashDeadLetter.repository";
import { QstashMessageLogRepository } from "./repositories/QstashMessageLog.repository";
import type {
  QstashCallbackHandler,
  QstashDeadLetter,
  QstashMessage,
  QstashMessageLog,
  QstashPublishOptions,
  QstashPublishResult,
  QstashReceiptHandler,
  QstashServiceConfig,
} from "./types";

/** Configuration after defaults have been applied. */
type ResolvedConfig = QstashServiceConfig & {
  defaultRetries: number;
  defaultRetryDelay: number;
};

/** Public surface shared by every QStash service implementation. */
export interface IQstashService {
  /** Verify the signature of an inbound QStash request. */
  verifySignature(
    body: string,
    signature: string,
    url?: string
  ): Promise<boolean>;
  /** Access the low-level QStash client. */
  getClient(): Client;
  /** Access the signature receiver. */
  getReceiver(): Receiver;
}

/**
 * High-level wrapper around Upstash QStash.
 *
 * Responsibilities:
 * - publish (single / batch) and scheduled publishing through queues/topics;
 * - persist a message log for every publish and expose read/list helpers;
 * - verify inbound request signatures;
 * - route deliveries/receipts to handlers registered by subclasses;
 * - track and retry dead-lettered messages.
 *
 * The service is designed to be subclassed: the operational methods are
 * `protected` so concrete services (mail, audit, …) can expose the subset they
 * need.
 */
export class QstashService implements IQstashService {
  private readonly config: ResolvedConfig;
  private readonly client: Client;
  private readonly receiver: Receiver;
  private readonly logs: QstashMessageLogRepository;
  private readonly dlq: QstashDeadLetterRepository;
  private readonly handlers: HandlerRegistry;

  constructor(qstashConfig: QstashServiceConfig) {
    this.config = this.normalizeConfig(qstashConfig);
    this.client = this.createClient();
    this.receiver = this.createReceiver();
    this.logs = new QstashMessageLogRepository(this.config.redisClient);
    this.dlq = new QstashDeadLetterRepository(this.config.redisClient);
    this.handlers = new HandlerRegistry();
  }

  // ─── Setup ────────────────────────────────────────────────────────────────

  /** Merge caller configuration with service defaults. */
  private normalizeConfig(config: QstashServiceConfig): ResolvedConfig {
    return {
      ...config,
      defaultRetries: config.defaultRetries ?? QSTASH_DEFAULTS.retries,
      defaultRetryDelay:
        config.defaultRetryDelay ?? QSTASH_DEFAULTS.retryDelayMs,
    };
  }

  /** Build the low-level QStash client, wrapping init failures. */
  private createClient(): Client {
    try {
      return new Client({
        token: this.config.token,
        baseUrl: this.config.baseUrl,
        retry: {
          retries: this.config.defaultRetries,
          backoff: (retryCount) =>
            Math.pow(2, retryCount) * this.config.defaultRetryDelay,
        },
      });
    } catch (err) {
      throw new QstashError(
        `Failed to initialize QStash client: ${formatError(err)}`,
        "QSTASH_CLIENT_INIT_FAILED",
        500
      );
    }
  }

  /** Build the signature receiver, wrapping init failures. */
  private createReceiver(): Receiver {
    try {
      return new Receiver({
        currentSigningKey: this.config.currentSigningKey,
        nextSigningKey: this.config.nextSigningKey,
      });
    } catch (err) {
      throw new QstashError(
        `Failed to initialize QStash receiver: ${formatError(err)}`,
        "QSTASH_RECEIVER_INIT_FAILED",
        500
      );
    }
  }

  // ─── Publishing ─────────────────────────────────────────────────────────────

  /**
   * Publish a single message and persist its log.
   *
   * The transport is chosen by {@link dispatchToQstash} (explicit queue →
   * topic → default queue → direct).
   */
  protected async publish<T = unknown>(
    options: QstashPublishOptions<T>
  ): Promise<QstashPublishResult> {
    const normalized = normalizePublishOptions(
      options,
      this.config.defaultRetries
    );

    try {
      const messageId = await this.dispatchToQstash(normalized);

      await this.logs.store(toLogEntry(normalized, messageId), normalized.body);

      return { messageId, deduplicationId: normalized.deduplicationId };
    } catch (err) {
      throw err instanceof QstashError
        ? err
        : new QstashError(
            `Failed to publish to QStash: ${formatError(err)}`,
            "QSTASH_PUBLISH_FAILED",
            500,
            { url: normalized.url, deduplicationId: normalized.deduplicationId }
          );
    }
  }

  /**
   * Publish multiple messages in a single QStash batch request and persist a
   * log for each.
   *
   * Note: QStash batch publishing targets URLs/queues and does not support
   * topics. The configured `defaultQueue` is applied to every message unless a
   * per-message `queueName` is provided.
   */
  protected async publishBatch<T = unknown>(
    options: QstashPublishOptions<T>[]
  ): Promise<QstashPublishResult[]> {
    if (options.length === 0) return [];

    const entries = options.map((option) =>
      normalizePublishOptions(option, this.config.defaultRetries)
    );

    try {
      const responses = (await this.client.batch(
        entries.map((entry) => this.buildBatchRequest(entry))
      )) as Array<{ messageId: string }>;

      return await Promise.all(
        responses.map(async (response, index) => {
          const entry = entries[index];
          if (!entry) {
            throw new QstashError(
              "Batch response/request mismatch",
              "QSTASH_BATCH_PUBLISH_FAILED",
              500,
              { index }
            );
          }

          await this.logs.store(
            toLogEntry(entry, response.messageId),
            entry.body
          );

          return {
            messageId: response.messageId,
            deduplicationId: entry.deduplicationId,
          };
        })
      );
    } catch (err) {
      throw err instanceof QstashError
        ? err
        : new QstashError(
            `Failed to publish batch to QStash: ${formatError(err)}`,
            "QSTASH_BATCH_PUBLISH_FAILED",
            500,
            { count: options.length }
          );
    }
  }

  /**
   * Enqueue a message onto a queue for delayed delivery.
   *
   * Provide either `delay` (seconds from now) or `notBefore` (absolute unix
   * timestamp in seconds). Falls back to the configured `defaultQueue` when no
   * `queueName` is given.
   */
  protected async scheduleQueue<T = unknown>(
    options: QstashPublishOptions<T>
  ): Promise<QstashPublishResult> {
    const queueName = options.queueName ?? this.config.defaultQueue;

    if (!queueName) {
      throw new QstashError(
        "No queue configured for scheduled delivery",
        "QSTASH_QUEUE_MISSING",
        400,
        { url: options.url }
      );
    }

    if (options.delay === undefined && options.notBefore === undefined) {
      throw new QstashError(
        "scheduleQueue requires either 'delay' or 'notBefore'",
        "QSTASH_SCHEDULE_MISSING",
        400,
        { url: options.url }
      );
    }

    return this.publish({ ...options, queueName });
  }

  /**
   * Dispatch a normalized message using the first transport that applies:
   *
   * 1. explicit `queueName`  → `queue(...).enqueueJSON`
   * 2. configured topic      → `publishJSON` with `topic`
   * 3. configured default queue → `queue(...).enqueueJSON`
   * 4. direct                → `publishJSON`
   *
   * @returns the QStash message id.
   */
  private async dispatchToQstash(
    params: NormalizedPublishOptions<unknown>
  ): Promise<string> {
    const base = this.buildRequestBase(params);

    if (params.queueName) {
      const result = await this.client
        .queue({ queueName: params.queueName })
        .enqueueJSON(base);
      return result.messageId;
    }

    if (this.config.defaultTopic) {
      const result = await this.client.publishJSON({
        ...base,
        topic: this.config.defaultTopic,
      });
      return result.messageId;
    }

    if (this.config.defaultQueue) {
      const result = await this.client
        .queue({ queueName: this.config.defaultQueue })
        .enqueueJSON(base);
      return result.messageId;
    }

    const result = await this.client.publishJSON(base);
    return result.messageId;
  }

  /**
   * Build the transport-agnostic request payload shared by every QStash call.
   * Only defined options are included so the SDK does not send empty fields.
   */
  private buildRequestBase(
    params: NormalizedPublishOptions<unknown>
  ): Record<string, unknown> {
    return {
      url: params.url,
      body: params.contentType === "text" ? String(params.body) : params.body,
      deduplicationId: params.deduplicationId,
      retries: params.maxRetries,
      retryDelay: retryDelayExpression(this.config.defaultRetryDelay),
      ...(params.callback && { callback: params.callback }),
      ...(params.failureCallback && {
        failureCallback: params.failureCallback,
      }),
      ...(Object.keys(params.headers).length > 0 && {
        headers: params.headers,
      }),
      ...(params.delay !== undefined && { delay: params.delay }),
      ...(params.notBefore !== undefined && { notBefore: params.notBefore }),
    };
  }

  /**
   * Build a single entry for the QStash batch endpoint. Batch entries carry
   * their own queue and a serialized body with a matching content-type.
   */
  private buildBatchRequest(
    params: NormalizedPublishOptions<unknown>
  ): PublishBatchRequest {
    const headers: Record<string, string> = {
      ...(params.contentType === "json" && {
        "content-type": "application/json",
      }),
      ...params.headers,
    };
    const queueName = params.queueName ?? this.config.defaultQueue;

    return {
      url: params.url,
      body:
        params.contentType === "json"
          ? JSON.stringify(params.body)
          : String(params.body),
      deduplicationId: params.deduplicationId,
      retries: params.maxRetries,
      retryDelay: retryDelayExpression(this.config.defaultRetryDelay),
      ...(params.callback && { callback: params.callback }),
      ...(params.failureCallback && {
        failureCallback: params.failureCallback,
      }),
      ...(Object.keys(headers).length > 0 && { headers }),
      ...(params.delay !== undefined && { delay: params.delay }),
      ...(params.notBefore !== undefined && { notBefore: params.notBefore }),
      ...(queueName && { queueName }),
    };
  }

  // ─── Signature verification ───────────────────────────────────────────────

  /**
   * Verify the signature of an inbound QStash request.
   *
   * @throws {QstashError} `QSTASH_SIGNATURE_INVALID` (401) for bad signatures,
   * `QSTASH_VERIFICATION_ERROR` (500) for any other verification failure.
   */
  public async verifySignature(
    body: string,
    signature: string,
    url?: string
  ): Promise<boolean> {
    try {
      return await this.receiver.verify({ body, signature, url });
    } catch (error) {
      const isSignatureError =
        error instanceof Error && error.message.includes("signature");

      throw isSignatureError
        ? new QstashError(
            "Signature verification failed",
            "QSTASH_SIGNATURE_INVALID",
            401
          )
        : new QstashError(
            `Verification error: ${formatError(error)}`,
            "QSTASH_VERIFICATION_ERROR",
            500
          );
    }
  }

  // ─── Deduplication ────────────────────────────────────────────────────────

  /** Build a deterministic dedup key for `content` within `scope`. */
  protected generateDedupKey(content: unknown, scope = "default"): string {
    return buildDedupKey(content, scope);
  }

  /** Remove a dedup key so the same content can be published again. */
  protected async clearDedupCache(key: string): Promise<void> {
    await this.config.redisClient.del(key);
  }

  // ─── Handler registration ─────────────────────────────────────────────────

  /** Register the handler that processes deliveries for `routeKey`. */
  protected registerCallbackHandler<T = unknown>(
    routeKey: string,
    handler: QstashCallbackHandler<T>
  ): void {
    this.handlers.setCallback(routeKey, handler as QstashCallbackHandler);
  }

  /** Register the handler that processes receipts for `routeKey`. */
  protected registerReceiptHandler(
    routeKey: string,
    handler: QstashReceiptHandler
  ): void {
    this.handlers.setReceipt(routeKey, handler);
  }

  // ─── Delivery processing ──────────────────────────────────────────────────

  /**
   * Run the registered callback handler for a delivery and update its log.
   *
   * The log is marked `delivered` on success and `failed` (with the retry
   * counter incremented) on error; the original error is re-thrown so QStash
   * can retry.
   */
  protected async processCallback<T = unknown>(
    payload: T,
    context: { messageId: string; routeKey: string }
  ): Promise<unknown> {
    const { messageId, routeKey } = context;

    const handler = this.handlers.getCallback(routeKey);
    if (!handler) {
      throw new QstashError(
        `No callback handler registered for route: ${routeKey}`,
        "QSTASH_CALLBACK_HANDLER_MISSING",
        404
      );
    }

    try {
      const result = await handler(payload, { messageId });

      await this.logs.update(messageId, {
        state: "delivered",
        deliveredAt: Date.now(),
      });

      return result;
    } catch (error) {
      const log = await this.logs.fetch(messageId);
      await this.logs.update(messageId, {
        state: "failed",
        retried: (log?.retried ?? 0) + 1,
      });
      throw error;
    }
  }

  /**
   * Handle a delivery receipt: mark the message delivered, or move it to the
   * dead letter queue once retries are exhausted. A route-specific receipt
   * handler, when registered, is invoked on dead-lettering.
   */
  protected async handleDeliveryReceipt(
    messageId: string,
    routeKey?: string
  ): Promise<void> {
    const log = requireLog(await this.logs.fetch(messageId), messageId);

    const isExhausted = log.retried >= log.maxRetries;

    if (isExhausted) {
      await this.logs.update(messageId, {
        state: "dead_letter",
        isDeadLetter: true,
      });
      await this.dlq.add(messageId);

      if (routeKey) {
        const handler = this.handlers.getReceipt(routeKey);
        if (handler) await handler(messageId);
      }
    } else {
      await this.logs.update(messageId, {
        state: "delivered",
        deliveredAt: Date.now(),
      });
    }
  }

  /** Mark a message as failed after a failed delivery callback. */
  protected async handleFailed(messageId: string): Promise<void> {
    requireLog(await this.logs.fetch(messageId), messageId);

    await this.logs.update(messageId, {
      state: "failed",
      deliveredAt: null,
    });
  }

  // ─── Message queries ──────────────────────────────────────────────────────

  /** List every message as a lightweight view. */
  protected async listMessages(): Promise<QstashMessage[]> {
    const logs = await this.loadAllLogs();
    return logs.map(toMessageView);
  }

  /** Fetch a single message view, or `null` when unknown. */
  protected async getMessage(messageId: string): Promise<QstashMessage | null> {
    const log = await this.logs.fetch(messageId);
    return log ? toMessageView(log) : null;
  }

  /** List every stored message log (full record). */
  protected async listMessageLogs(): Promise<QstashMessageLog[]> {
    return this.loadAllLogs();
  }

  /** Fetch a single stored message log, or `null` when unknown. */
  protected async getMessageLog(
    messageId: string
  ): Promise<QstashMessageLog | null> {
    return this.logs.fetch(messageId);
  }

  /** Read every stored log, resolving the message id from each Redis key. */
  private async loadAllLogs(): Promise<QstashMessageLog[]> {
    const keys = await this.logs.listAllKeys();
    const logs: QstashMessageLog[] = [];

    for (const key of keys) {
      const messageId = key.split(":").pop();
      if (!messageId) continue;

      const log = await this.logs.fetch(messageId);
      if (log) logs.push(log);
    }

    return logs;
  }

  // ─── Retries & dead letters ───────────────────────────────────────────────

  /**
   * Re-publish a `failed` or `dead_letter` message using its stored body and
   * options. The original log is marked `retrying` and removed from the DLQ.
   */
  protected async retryMessage(
    messageId: string,
    overrideOptions?: Partial<QstashPublishOptions>
  ): Promise<QstashPublishResult> {
    const log = await this.logs.fetch(messageId);

    if (!log || (log.state !== "failed" && log.state !== "dead_letter")) {
      throw new QstashError(
        "Message not found or not in a retryable state",
        "QSTASH_RETRY_INVALID_STATE",
        400,
        { messageId, state: log?.state }
      );
    }

    const body = await this.logs.fetchBody<unknown>(messageId, log.contentType);
    if (body === null) {
      throw new QstashError(
        "Original message body not found for retry",
        "QSTASH_RETRY_BODY_MISSING",
        400,
        { messageId }
      );
    }

    const result = await this.publish({
      url: log.url,
      body,
      deduplicationId: `retry_${Date.now()}_${messageId}`,
      retries: overrideOptions?.retries ?? log.maxRetries,
      callback: log.callback,
      failureCallback: log.failureCallback,
      contentType: log.contentType,
      ...overrideOptions,
    });

    await this.logs.update(messageId, {
      state: "retrying",
      isDeadLetter: false,
      scheduledAt: Date.now(),
      retried: log.retried + 1,
    });

    await this.dlq.remove(messageId);

    return result;
  }

  /** List the newest dead-lettered messages, up to `limit`. */
  protected async listDeadLetters(
    limit = QSTASH_DEFAULTS.dlqListLimit
  ): Promise<QstashDeadLetter[]> {
    const messageIds = await this.dlq.listIds(limit);
    const results: QstashDeadLetter[] = [];
    const stale: string[] = [];

    for (const messageId of messageIds) {
      const log = await this.logs.fetch(messageId);
      if (log) {
        results.push({
          messageId: log.messageId,
          createdAt: log.createdAt,
          retried: log.retried,
        });
      } else {
        stale.push(messageId);
      }
    }

    await this.dlq.removeMany(stale);

    return results;
  }

  /**
   * Apply a partial update to a message log. Setting `isDeadLetter: true`
   * also adds the message to the dead letter index.
   */
  protected async updateMessage(
    messageId: string,
    updates: Partial<QstashMessageLog>
  ): Promise<void> {
    await this.logs.update(messageId, updates);

    if (updates.isDeadLetter === true) {
      await this.dlq.add(messageId);
    }
  }

  /** Remove a message log, its stored body and any dead letter index entry. */
  protected async clearStatusCache(messageId: string): Promise<void> {
    await this.logs.remove(messageId);
    await this.dlq.remove(messageId);
  }

  // ─── Accessors ────────────────────────────────────────────────────────────

  /** Expose the underlying QStash client. */
  public getClient(): Client {
    return this.client;
  }

  /** Expose the signature receiver. */
  public getReceiver(): Receiver {
    return this.receiver;
  }
}
