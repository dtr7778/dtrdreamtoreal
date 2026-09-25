import { describe, expect, it, vi } from "vitest";

import type { ExtendedRedis } from "@workspace/lib/redis/ioRedis";
import { createMockRedisClient } from "@workspace/lib/redis/ioRedis/mock";
import type {
  EmailService,
  EmailThreadService,
  RawMailPayload,
  SendMailOption,
  TemplateMailPayload,
} from "@workspace/mail";

import { MailService } from "./Mail.service";
import type { MailQueueService } from "./MailQueue.service";

interface ServiceHarness {
  service: MailService;
  redis: ExtendedRedis;
  createOutboundEmailRecord: ReturnType<typeof vi.fn>;
  sendMail: ReturnType<typeof vi.fn>;
}

function createService(overrides?: {
  sendMail?: ReturnType<typeof vi.fn>;
}): Promise<ServiceHarness> {
  const redis = createMockRedisClient();
  const createOutboundEmailRecord = vi.fn(async () => ({
    emailId: "email-1",
    threadId: undefined,
  }));
  const sendMail =
    overrides?.sendMail ??
    vi.fn(async () => ({ jobId: "job-1", queue: "mail" }));
  const findOrCreateThread = vi.fn(async () => "thread-1");

  const emailService = {
    normalizeRecipients: (recipients: string | string[]) =>
      (Array.isArray(recipients) ? recipients : [recipients]).map((email) => ({
        email: email.toLowerCase(),
      })),
    extractPrimaryRecipient: (to: string | string[]) => ({
      email: (Array.isArray(to) ? (to[0] ?? "") : to).toLowerCase(),
    }),
    createOutboundEmailRecord,
  } as unknown as EmailService;

  const emailThreadService = {
    findOrCreateThread,
  } as unknown as EmailThreadService;

  const mailQueue = { sendMail } as unknown as MailQueueService;

  const service = new MailService(
    emailService,
    emailThreadService,
    mailQueue,
    redis,
    {
      appName: "Acme",
      supportMail: "support@acme.com",
      systemMail: "system@acme.com",
      dedupWindowSeconds: 300,
    }
  );

  return redis.flushall().then(() => ({
    service,
    redis,
    createOutboundEmailRecord,
    sendMail,
  }));
}

const welcomePayload: TemplateMailPayload<"welcome"> = {
  template: "welcome",
  data: { userName: "Jane", dashboardUrl: "https://acme.com/dashboard" },
  to: "jane@example.com",
};

describe("MailService.send", () => {
  it("renders, persists and enqueues a templated mail", async () => {
    const { service, createOutboundEmailRecord, sendMail } = await createService();

    const result = await service.send(welcomePayload);

    expect(createOutboundEmailRecord).toHaveBeenCalledOnce();
    expect(sendMail).toHaveBeenCalledWith({
      emailId: "email-1",
      threadId: undefined,
    });
    expect(result).toEqual({ jobId: "job-1", queue: "mail" });
  });

  it("rejects invalid template data with 400", async () => {
    const { service } = await createService();

    await expect(
      service.send({
        ...welcomePayload,
        data: { userName: "Jane" },
      } as unknown as TemplateMailPayload)
    ).rejects.toMatchObject({
      code: "MAIL_INVALID_PAYLOAD",
      statusCode: 400,
    });
  });

  it("throws 409 on a duplicate within the dedup window", async () => {
    const { service } = await createService();

    await service.send(welcomePayload);

    await expect(service.send(welcomePayload)).rejects.toMatchObject({
      code: "MAIL_DUPLICATE_SUPPRESSED",
      statusCode: 409,
    });
  });

  it("releases the dedup key when enqueue fails", async () => {
    const sendMail = vi.fn(async () => {
      throw new Error("queue down");
    });
    const { service } = await createService({ sendMail });

    await expect(service.send(welcomePayload)).rejects.toThrow("queue down");
    // The claim was released, so the retry fails on the queue again rather than
    // being suppressed as a duplicate.
    await expect(service.send(welcomePayload)).rejects.toThrow("queue down");
  });
});

describe("MailService.sendRaw", () => {
  it("sends raw html and defaults the sender to system mail", async () => {
    const { service, createOutboundEmailRecord, sendMail } = await createService();

    const payload: RawMailPayload = {
      to: "jane@example.com",
      subject: "Hi",
      html: "<p>Hi</p>",
    };

    await service.sendRaw(payload);

    const options = createOutboundEmailRecord.mock.calls[0]?.[0]
      ?.options as SendMailOption;

    expect(options.from).toBe("Acme <system@acme.com>");
    expect(options.html).toBe("<p>Hi</p>");
    expect(sendMail).toHaveBeenCalledOnce();
  });
});

describe("MailService batch", () => {
  it("returns [] for an empty batch", async () => {
    const { service } = await createService();

    expect(await service.sendBatch([])).toEqual([]);
    expect(await service.sendRawBatch([])).toEqual([]);
  });

  it("returns one result per templated item, in order", async () => {
    const { service, sendMail } = await createService();

    const second: TemplateMailPayload<"welcome"> = {
      ...welcomePayload,
      to: "sam@example.com",
    };

    const results = await service.sendBatch([welcomePayload, second]);

    expect(results).toHaveLength(2);
    expect(results.every((result) => result.success)).toBe(true);
    expect(results[0]?.jobId).toBe("job-1");
    expect(sendMail).toHaveBeenCalledTimes(2);
  });

  it("fails only the invalid item", async () => {
    const { service } = await createService();

    const invalid = {
      ...welcomePayload,
      to: "sam@example.com",
      data: { userName: "Sam" },
    } as unknown as TemplateMailPayload;

    const results = await service.sendBatch([welcomePayload, invalid]);

    expect(results[0]?.success).toBe(true);
    expect(results[1]?.success).toBe(false);
    expect(typeof results[1]?.error).toBe("string");
  });

  it("reports a duplicate item without failing the batch", async () => {
    const { service } = await createService();

    await service.send(welcomePayload);

    const results = await service.sendBatch([welcomePayload]);

    expect(results[0]).toMatchObject({ success: false });
    expect(results[0]?.error).toContain("Duplicate");
  });

  it("sends a raw batch", async () => {
    const { service, sendMail } = await createService();

    const results = await service.sendRawBatch([
      { to: "a@example.com", subject: "A", html: "<p>A</p>" },
      { to: "b@example.com", subject: "B", text: "B" },
    ]);

    expect(results).toHaveLength(2);
    expect(results.every((result) => result.success)).toBe(true);
    expect(sendMail).toHaveBeenCalledTimes(2);
  });
});
