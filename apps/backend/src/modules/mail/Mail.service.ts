import { createHash } from "node:crypto";

import { StatusCodes } from "http-status-codes";
import { inject } from "inversify";

import { EnqueueResult } from "@workspace/lib/bullmq";
import { MailError } from "@workspace/lib/utils";
import {
  type EmailService,
  type EmailThreadService,
  type MailBatchItemResult,
  type MailServiceConfig,
  mailTemplateDefinitions,
  RawMailPayload,
  rawMailPayloadSchema,
  SendMailOption,
  type TemplateMailPayload,
} from "@workspace/mail";
import { renderMailTemplate } from "@workspace/mail/template-registry";
import { type ExtendedRedis } from "@workspace/redis/client/ioRedis";

import { CONTAINER_TYPES } from "@/container/container-types";
import { env } from "@/env";

import { type MailQueueService } from "./MailQueue.service";

export interface IMailService {
  send(payload: TemplateMailPayload): Promise<EnqueueResult>;
  sendRaw(payload: RawMailPayload): Promise<EnqueueResult>;
  sendBatch(payloads: TemplateMailPayload[]): Promise<MailBatchItemResult[]>;
  sendRawBatch(payloads: RawMailPayload[]): Promise<MailBatchItemResult[]>;
}

export class MailService implements IMailService {
  private readonly mailConfig: MailServiceConfig;
  private readonly dedupWindowSeconds: number;

  constructor(
    @inject(CONTAINER_TYPES.Redis)
    private readonly redis: ExtendedRedis,
    @inject(CONTAINER_TYPES.EmailService)
    private readonly emailService: EmailService,
    @inject(CONTAINER_TYPES.EmailThreadService)
    private readonly emailThreadService: EmailThreadService,
    @inject(CONTAINER_TYPES.MailQueueService)
    private readonly mailQueue: MailQueueService
  ) {
    this.mailConfig = {
      appName: env.APP_NAME,
      supportMail: env.SUPPORT_MAIL,
      systemMail: env.SYSTEM_MAIL,
    };
    this.dedupWindowSeconds = 300;
  }

  /** Render a registered template, persist it and enqueue the send. */
  public async send(payload: TemplateMailPayload): Promise<EnqueueResult> {
    const definition = mailTemplateDefinitions[payload.template];
    const parsed = definition.data.safeParse(payload.data);

    if (!parsed.success) {
      throw new MailError(
        parsed.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; "),
        "MAIL_INVALID_PAYLOAD",
        StatusCodes.BAD_REQUEST
      );
    }

    const subject = definition.subject(parsed.data as Record<string, unknown>, {
      appName: this.mailConfig.appName,
    });

    const dedupKey = this.generateDedupKey(
      payload.template,
      payload.to,
      subject
    );

    await this.claimDedup(dedupKey);

    const { html, text } = await renderMailTemplate(
      payload.template,
      parsed.data,
      this.mailConfig
    );

    return this.dispatch(
      {
        from: this.buildMailFrom(definition.from),
        to: payload.to,
        cc: payload.cc,
        bcc: payload.bcc,
        replyTo: payload.replyTo,
        subject,
        html,
        text,
      },
      {
        dedupKey,
        isSystemMail: definition.isSystemMail,
      }
    );
  }

  /** Persist a pre-rendered mail and enqueue the send. */
  public async sendRaw(payload: RawMailPayload): Promise<EnqueueResult> {
    const parsed = rawMailPayloadSchema.parse(payload);

    const dedupKey = this.generateDedupKey("raw", parsed.to, parsed.subject);

    await this.claimDedup(dedupKey);

    return this.dispatch(
      {
        from: parsed.from ?? this.buildMailFrom("system"),
        to: parsed.to,
        cc: parsed.cc,
        bcc: parsed.bcc,
        replyTo: parsed.replyTo,
        subject: parsed.subject,
        html: parsed.html,
        text: parsed.text,
      },
      { dedupKey, isSystemMail: false }
    );
  }

  /** Render and enqueue several templated mails, one result per item. */
  public async sendBatch(
    payloads: TemplateMailPayload[]
  ): Promise<MailBatchItemResult[]> {
    return Promise.all(
      payloads.map((payload) => this.runBatchItem(() => this.send(payload)))
    );
  }

  /** Enqueue several pre-rendered mails, one result per item. */
  public async sendRawBatch(
    payloads: RawMailPayload[]
  ): Promise<MailBatchItemResult[]> {
    return Promise.all(
      payloads.map((payload) => this.runBatchItem(() => this.sendRaw(payload)))
    );
  }

  /** Run a single batch item, capturing its failure instead of throwing. */
  private async runBatchItem(
    action: () => Promise<EnqueueResult>
  ): Promise<MailBatchItemResult> {
    try {
      const { jobId, queue } = await action();

      return { success: true, jobId, queue };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error occurred",
      };
    }
  }

  /** Claim the dedup key, persist the mail and enqueue it. */
  private async dispatch(
    options: SendMailOption,
    meta: { dedupKey: string; isSystemMail: boolean }
  ): Promise<EnqueueResult> {
    try {
      let threadId: string | undefined;

      if (!meta.isSystemMail) {
        const recipient = this.emailService.extractPrimaryRecipient(options.to);

        threadId = await this.emailThreadService.findOrCreateThread({
          subject: `Re: ${options.subject}`,
          contactEmail: recipient.email,
          contactName: recipient.name,
        });
      }

      const { emailId } = await this.emailService.createOutboundEmailRecord({
        options,
        threadId,
      });

      return await this.mailQueue.sendMail({ emailId, threadId });
    } catch (err) {
      await this.releaseDedup(meta.dedupKey);
      throw err;
    }
  }

  /** Build the RFC 5322 sender for a template's configured address. */
  private buildMailFrom(kind: "system" | "support"): string {
    const address =
      kind === "support"
        ? this.mailConfig.supportMail
        : this.mailConfig.systemMail;

    return `${this.mailConfig.appName} <${address}>`;
  }

  /** Build the dedup key from the mail kind, recipients and subject. */
  private generateDedupKey(
    kind: string,
    to: SendMailOption["to"],
    subject: string
  ): string {
    const recipients = this.emailService
      .normalizeRecipients(to)
      .map((recipient) => recipient.email)
      .sort()
      .join(",");

    const hash = createHash("sha256")
      .update(`${kind}|${recipients}|${subject}`)
      .digest("hex")
      .slice(0, 32);

    return `mail:dedup:${hash}`;
  }

  /** Atomically claim the dedup key, throwing on an existing claim. */
  private async claimDedup(key: string): Promise<void> {
    const result = await this.redis.set(
      key,
      "1",
      "EX",
      this.dedupWindowSeconds,
      "NX"
    );

    if (result !== "OK") {
      throw new MailError(
        "Duplicate email suppressed within dedup window.",
        "MAIL_DUPLICATE_SUPPRESSED",
        409
      );
    }
  }

  /** Release a dedup claim so a failed enqueue can be retried. */
  private async releaseDedup(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
