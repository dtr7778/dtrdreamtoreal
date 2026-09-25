import {
  BullmqClientService,
  type BullmqClientServiceConfig,
} from "@workspace/lib/bullmq";
import { formatError } from "@workspace/lib/utils";

import {
  type MailTemplateName,
  mailTemplatePayloadSchema,
  type RawMailPayload,
  rawMailBatchPayloadSchema,
  rawMailPayloadSchema,
  templateMailBatchPayloadSchema,
  type TemplateMailPayload,
} from "../definitions";
import type { BullmqMailResult } from "../types";

/** Job keys the mail publisher uses to route an enqueue. */
export const BULLMQ_MAIL_JOBS = {
  send: "send",
  sendRaw: "sendRaw",
  sendBatch: "sendBatch",
  sendRawBatch: "sendRawBatch",
} as const;

export type BullmqMailJob =
  (typeof BULLMQ_MAIL_JOBS)[keyof typeof BULLMQ_MAIL_JOBS];

export interface IBullmqMailService {
  /** Render-and-send a registered template on the backend. */
  send<K extends MailTemplateName>(
    payload: TemplateMailPayload<K>
  ): Promise<BullmqMailResult>;
  /** Send a pre-rendered `html`/`text` mail on the backend. */
  sendRaw(payload: RawMailPayload): Promise<BullmqMailResult>;
  /** Send several templated mails in one batch request. */
  sendBatch(payloads: TemplateMailPayload[]): Promise<BullmqMailResult[]>;
  /** Send several pre-rendered mails in one batch request. */
  sendRawBatch(payloads: RawMailPayload[]): Promise<BullmqMailResult[]>;
}

/**
 * Thin, caller-side mail producer.
 *
 * It only validates the payload, signs it and hands it to an app-supplied
 * publisher (an HTTP call on the web, a direct service call on the backend).
 * Rendering, deduplication and persistence all happen server-side.
 */
export class BullmqMailService
  extends BullmqClientService
  implements IBullmqMailService
{
  constructor(config: BullmqClientServiceConfig) {
    super(config);
  }

  public async send<K extends MailTemplateName>(
    payload: TemplateMailPayload<K>
  ): Promise<BullmqMailResult> {
    const parsed = mailTemplatePayloadSchema.parse(payload);

    return this.publish(BULLMQ_MAIL_JOBS.send, parsed);
  }

  public async sendRaw(payload: RawMailPayload): Promise<BullmqMailResult> {
    const parsed = rawMailPayloadSchema.parse(payload);

    return this.publish(BULLMQ_MAIL_JOBS.sendRaw, parsed);
  }

  public async sendBatch(
    payloads: TemplateMailPayload[]
  ): Promise<BullmqMailResult[]> {
    if (payloads.length === 0) return [];

    const parsed = templateMailBatchPayloadSchema.parse({ items: payloads });

    return this.publishBatch(BULLMQ_MAIL_JOBS.sendBatch, parsed.items);
  }

  public async sendRawBatch(
    payloads: RawMailPayload[]
  ): Promise<BullmqMailResult[]> {
    if (payloads.length === 0) return [];

    const parsed = rawMailBatchPayloadSchema.parse({ items: payloads });

    return this.publishBatch(BULLMQ_MAIL_JOBS.sendRawBatch, parsed.items);
  }

  /** Sign and enqueue a single payload, shaping the result for callers. */
  private async publish<T>(
    job: BullmqMailJob,
    payload: T
  ): Promise<BullmqMailResult> {
    try {
      const result = await this.enqueue<T>({
        queue: "mail",
        job,
        payload,
      });

      return { success: true, messageId: result.messageId };
    } catch (err) {
      return {
        success: false,
        error: formatError(err),
      };
    }
  }

  /** Enqueue a batch in one request, mapping per-item results. */
  private async publishBatch<T>(
    job: BullmqMailJob,
    payloads: T[]
  ): Promise<BullmqMailResult[]> {
    if (payloads.length === 0) return [];

    try {
      const results = await this.enqueueBatch<T>({
        queue: "mail",
        job,
        payload: payloads,
      });

      return results.map((result) => ({
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      }));
    } catch (err) {
      const error = formatError(err);

      return payloads.map(() => ({ success: false, error }));
    }
  }
}
