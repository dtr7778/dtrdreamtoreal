import { createHash, randomUUID } from "node:crypto";

import { Client, Receiver } from "@upstash/qstash";

import { QstashError } from "./QstashError";
import {
  ContentType,
  DeadLetterQueue,
  MessageLogRepository,
  QstashLogEntry,
} from "./QstashMessageLog.repository";
import { QstashServiceConfig } from "./types";

export interface QstashPublishOptions<T = unknown> {
  url: string;
  body: T;
  deduplicationId?: string;
  retries?: number;
  callback: string | null;
  failureCallback: string | null;
  contentType?: ContentType;
  headers?: Record<string, string>;
  routeKey?: string;
}

export type QstashCallbackHandler<T = unknown> = (
  payload: T,
  context: { messageId: string }
) => Promise<unknown>;

export type QstashReceiptHandler = (messageId: string) => Promise<void>;

export interface QstashPublishResult {
  messageId: string;
  deduplicationId: string;
}

export type QstashMessage = Pick<
  QstashLogEntry,
  | "messageId"
  | "state"
  | "deliveredAt"
  | "isDeadLetter"
  | "createdAt"
  | "scheduledAt"
>;

export type QstashDeadLetter = Pick<
  QstashLogEntry,
  "messageId" | "retried" | "createdAt"
>;

export interface IQstashService {
  updateMessage(
    messageId: string,
    updates: Partial<QstashLogEntry>
  ): Promise<void>;
  generateDedupKey(content: unknown, scope?: string): string;
  publish<T = unknown>(
    options: QstashPublishOptions<T>
  ): Promise<QstashPublishResult>;
  verifySignature(
    body: string,
    signature: string,
    url?: string
  ): Promise<boolean>;
  registerCallbackHandler<T>(
    routeKey: string,
    handler: QstashCallbackHandler<T>
  ): void;
  registerReceiptHandler(routeKey: string, handler: QstashReceiptHandler): void;
  processCallback<T>(
    payload: T,
    context: { messageId: string; routeKey: string }
  ): Promise<unknown>;
  handleDeliveryReceipt(messageId: string, routeKey?: string): Promise<void>;
  handleFailed(messageId: string): Promise<void>;
  listMessages(): Promise<Array<QstashMessage>>;
  getMessage(messageId: string): Promise<QstashMessage | null>;
  retryMessage(
    messageId: string,
    overrideOptions?: Partial<QstashPublishOptions>
  ): Promise<QstashPublishResult>;
  listDeadLetters(limit?: number): Promise<Array<QstashDeadLetter>>;
  clearDedupCache(key: string): Promise<void>;
  clearStatusCache(messageId: string): Promise<void>;
  getClient(): Client;
  getReceiver(): Receiver;
}

const DEFAULTS = {
  retries: 3,
  retryDelayMs: 1000,
  dlqListLimit: 50,
} as const;

class HandlerRegistry {
  private readonly callbacks = new Map<string, QstashCallbackHandler>();
  private readonly receipts = new Map<string, QstashReceiptHandler>();

  setCallback(routeKey: string, handler: QstashCallbackHandler): void {
    this.callbacks.set(routeKey, handler);
  }

  setReceipt(routeKey: string, handler: QstashReceiptHandler): void {
    this.receipts.set(routeKey, handler);
  }

  getCallback(routeKey: string): QstashCallbackHandler | undefined {
    return this.callbacks.get(routeKey);
  }

  getReceipt(routeKey: string): QstashReceiptHandler | undefined {
    return this.receipts.get(routeKey);
  }
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unknown error";
}

function requireLog(
  log: QstashLogEntry | null,
  messageId: string
): QstashLogEntry {
  if (!log) {
    throw new QstashError(
      `Message log not found: ${messageId}`,
      "QSTASH_LOG_NOT_FOUND",
      404,
      { messageId }
    );
  }
  return log;
}

function toMessageView(log: QstashLogEntry): QstashMessage {
  return {
    messageId: log.messageId,
    state: log.state,
    deliveredAt: log.deliveredAt,
    isDeadLetter: log.isDeadLetter,
    createdAt: log.createdAt,
    scheduledAt: log.scheduledAt,
  };
}

// ─── QstashService ──────────────────────────────────────────────────────────

export class QstashService implements IQstashService {
  private readonly config: QstashServiceConfig & {
    defaultRetries: number;
    defaultRetryDelay: number;
  };

  private readonly client: Client;
  private readonly receiver: Receiver;
  private readonly logs: MessageLogRepository;
  private readonly dlq: DeadLetterQueue;
  private readonly handlers: HandlerRegistry;

  constructor(qstashConfig: QstashServiceConfig) {
    this.config = this.normalizeConfig(qstashConfig);
    this.client = this.createClient();
    this.receiver = this.createReceiver();
    this.logs = new MessageLogRepository(this.config.redisClient);
    this.dlq = new DeadLetterQueue(this.config.redisClient);
    this.handlers = new HandlerRegistry();
  }

  private normalizeConfig(config: QstashServiceConfig): QstashServiceConfig & {
    defaultRetries: number;
    defaultRetryDelay: number;
  } {
    return {
      ...config,
      defaultRetries: config.defaultRetries ?? DEFAULTS.retries,
      defaultRetryDelay: config.defaultRetryDelay ?? DEFAULTS.retryDelayMs,
    };
  }
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
        `Failed to initialize QStash client: ${errorMessage(err)}`,
        "QSTASH_CLIENT_INIT_FAILED",
        500
      );
    }
  }
  private createReceiver(): Receiver {
    try {
      return new Receiver({
        currentSigningKey: this.config.currentSigningKey,
        nextSigningKey: this.config.nextSigningKey,
      });
    } catch (err) {
      throw new QstashError(
        `Failed to initialize QStash receiver: ${errorMessage(err)}`,
        "QSTASH_RECEIVER_INIT_FAILED",
        500
      );
    }
  }

  public async publish<T = unknown>(
    options: QstashPublishOptions<T>
  ): Promise<QstashPublishResult> {
    const {
      url,
      body,
      deduplicationId: providedDedupId,
      retries,
      callback,
      failureCallback,
      contentType = "json",
      headers = {},
    } = options;

    const deduplicationId =
      providedDedupId ?? `dedup_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const maxRetries = retries ?? this.config.defaultRetries;

    try {
      const messageId = await this.dispatchToQstash({
        url,
        body: contentType === "text" ? String(body) : body,
        deduplicationId,
        retries: maxRetries,
        callback: callback ?? undefined,
        failureCallback: failureCallback ?? undefined,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
      });

      await this.logs.store(
        {
          messageId,
          deduplicationId,
          state: "pending",
          retried: 0,
          maxRetries,
          url,
          callback,
          failureCallback,
          contentType,
          deliveredAt: null,
          isDeadLetter: false,
          createdAt: Date.now(),
          scheduledAt: Date.now(),
        },
        body
      );

      return { messageId, deduplicationId };
    } catch (err) {
      throw err instanceof QstashError
        ? err
        : new QstashError(
            `Failed to publish to QStash: ${errorMessage(err)}`,
            "QSTASH_PUBLISH_FAILED",
            500,
            { url, deduplicationId }
          );
    }
  }

  /**
   * Dispatches a message to QStash using the configured transport:
   *   1. Topic (if defaultTopic is set) — publishJSON with topic
   *   2. Queue (if defaultQueue is set) — enqueueJSON
   *   3. Direct — publishJSON without topic
   */
  private async dispatchToQstash(params: {
    url: string;
    body: unknown;
    deduplicationId: string;
    retries: number;
    callback?: string;
    failureCallback?: string;
    headers?: Record<string, string>;
  }): Promise<string> {
    const retryDelay = `pow(2, retried) * ${this.config.defaultRetryDelay}`;

    const base: Record<string, unknown> = {
      url: params.url,
      body: params.body,
      deduplicationId: params.deduplicationId,
      retries: params.retries,
      retryDelay,
      ...(params.callback && { callback: params.callback }),
      ...(params.failureCallback && {
        failureCallback: params.failureCallback,
      }),
      ...(params.headers && { headers: params.headers }),
    };

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
            `Verification error: ${errorMessage(error)}`,
            "QSTASH_VERIFICATION_ERROR",
            500
          );
    }
  }

  private dedupKey(hash: string) {
    return `qstash:dedup:${hash}`;
  }
  public generateDedupKey(content: unknown, scope = "default"): string {
    const str = typeof content === "string" ? content : JSON.stringify(content);
    const hash = createHash("sha256")
      .update(`${scope}:${str}`)
      .digest("hex")
      .slice(0, 32);
    return this.dedupKey(hash);
  }

  public async clearDedupCache(key: string): Promise<void> {
    await this.config.redisClient.del(key);
  }

  public registerCallbackHandler<T = unknown>(
    routeKey: string,
    handler: QstashCallbackHandler<T>
  ): void {
    this.handlers.setCallback(routeKey, handler as QstashCallbackHandler);
  }

  public registerReceiptHandler(
    routeKey: string,
    handler: QstashReceiptHandler
  ): void {
    this.handlers.setReceipt(routeKey, handler);
  }

  /**
   * Processes an incoming QStash callback by dispatching to the registered
   * handler for the given routeKey. Updates message state accordingly.
   */
  public async processCallback<T = unknown>(
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

    await this.logs.update(messageId, { state: "pending" });

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

  public async handleDeliveryReceipt(
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

  public async handleFailed(messageId: string): Promise<void> {
    requireLog(await this.logs.fetch(messageId), messageId);

    await this.logs.update(messageId, {
      state: "failed",
      deliveredAt: null,
    });
  }

  public async listMessages(): Promise<QstashMessage[]> {
    const keys = await this.logs.listAllKeys();
    const messages: QstashMessage[] = [];

    for (const key of keys) {
      const messageId = key.split(":").pop();
      if (!messageId) continue;

      const log = await this.logs.fetch(messageId);
      if (log) messages.push(toMessageView(log));
    }

    return messages;
  }

  public async getMessage(messageId: string): Promise<QstashMessage | null> {
    const log = await this.logs.fetch(messageId);
    return log ? toMessageView(log) : null;
  }

  public async retryMessage(
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

  public async listDeadLetters(
    limit = DEFAULTS.dlqListLimit
  ): Promise<Array<QstashDeadLetter>> {
    const messageIds = await this.dlq.listIds(limit);
    const results: Array<QstashDeadLetter> = [];

    for (const messageId of messageIds) {
      const log = await this.logs.fetch(messageId);
      if (log) {
        results.push({
          messageId: log.messageId,
          createdAt: log.createdAt,
          retried: log.retried,
        });
      }
    }

    return results;
  }

  public async updateMessage(
    messageId: string,
    updates: Partial<QstashLogEntry>
  ): Promise<void> {
    await this.logs.update(messageId, updates);

    if (updates.isDeadLetter === true) {
      await this.dlq.add(messageId);
    }
  }

  public async clearStatusCache(messageId: string): Promise<void> {
    await this.logs.remove(messageId);
  }

  public getClient(): Client {
    return this.client;
  }

  public getReceiver(): Receiver {
    return this.receiver;
  }
}
