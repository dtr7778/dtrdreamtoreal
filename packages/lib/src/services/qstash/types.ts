import { ExtendedRedis } from "../redis";

export interface QstashClientConfig {
  baseUrl: string;
  token: string;
  /** The base delay used for exponential backoff in milliseconds */
  defaultRetryDelay?: number;
}

export interface QstashReceiverConfig {
  currentSigningKey: string;
  nextSigningKey: string;
}

export interface QstashServiceDependencies {
  redisClient: ExtendedRedis;
}

export interface QstashServiceConfig
  extends QstashClientConfig, QstashReceiverConfig, QstashServiceDependencies {
  defaultRetries?: number;
  defaultTopic?: string;
  defaultQueue?: string;
}

export interface QstashReceiptPayload {
  status: number;
  header: Record<string, unknown>;
  body: string;
  retried: number;
  dlqId?: string;
  sourceMessageId: string;
  url: string;
  method: string;
  sourceHeader: Record<string, unknown>;
  sourceBody: string;
  failureCallback: string;
  maxRetries: number;
  notBefore: number;
  createdAt: number;
  messageId: string;
}
