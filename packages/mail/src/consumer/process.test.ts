import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DatabaseType } from "@workspace/drizzle/client";
import type { LoggerType } from "@workspace/lib/logger";

import { MailQueueProcessor } from "./process";

const { getEmailById, buildOutboundEmailOptions, updateEmailById } =
  vi.hoisted(() => ({
    getEmailById: vi.fn(),
    buildOutboundEmailOptions: vi.fn(),
    updateEmailById: vi.fn(),
  }));

vi.mock("../services/Email.service", () => ({
  EmailService: class {
    public getEmailById = getEmailById;
    public buildOutboundEmailOptions = buildOutboundEmailOptions;
    public updateEmailById = updateEmailById;
  },
}));

const emailId = "11111111-1111-4111-8111-111111111111";

function envelope() {
  return {
    version: 1 as const,
    emailId,
    queuedAt: 1_700_000_000_000,
    isSystemMail: true,
  };
}

function processorWith(
  send = vi.fn<(options: unknown) => Promise<string>>(async () => "resend-1")
) {
  const database = {} as DatabaseType;
  const transport = { send };
  const logger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as unknown as LoggerType;

  return {
    processor: new MailQueueProcessor(database, transport, logger),
    send,
  };
}

describe("MailQueueProcessor.processMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateEmailById.mockResolvedValue(undefined);
    buildOutboundEmailOptions.mockResolvedValue({
      from: "a@x.com",
      to: ["b@x.com"],
      subject: "s",
      text: "t",
    });
  });

  it("marks an invalid payload as invalid without sending", async () => {
    const { processor, send } = processorWith();

    const result = await processor.processMessage({ nope: true });

    expect(result).toEqual({ status: "invalid" });
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects an unsupported envelope version", async () => {
    const { processor, send } = processorWith();

    const result = await processor.processMessage({
      ...envelope(),
      version: 2,
    });

    expect(result).toEqual({ status: "invalid" });
    expect(send).not.toHaveBeenCalled();
  });

  it("acks an unknown email as invalid", async () => {
    getEmailById.mockResolvedValueOnce(undefined);
    const { processor, send } = processorWith();

    const result = await processor.processMessage(envelope());

    expect(result).toEqual({ status: "invalid", emailId });
    expect(send).not.toHaveBeenCalled();
  });

  it("skips an email that was already sent", async () => {
    getEmailById.mockResolvedValueOnce({ id: emailId, status: "sent" });
    const { processor, send } = processorWith();

    const result = await processor.processMessage(envelope());

    expect(result).toEqual({ status: "skipped", emailId });
    expect(send).not.toHaveBeenCalled();
  });

  it("sends and records the resend id on success", async () => {
    getEmailById.mockResolvedValueOnce({ id: emailId, status: "queued" });
    const { processor, send } = processorWith();

    const result = await processor.processMessage(envelope());

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "s" })
    );
    expect(updateEmailById).toHaveBeenCalledWith(emailId, {
      status: "sent",
      resendId: "resend-1",
    });
    expect(result).toEqual({ status: "sent", emailId, resendId: "resend-1" });
  });

  it("marks failed and rethrows on send error", async () => {
    getEmailById.mockResolvedValueOnce({ id: emailId, status: "queued" });
    const { processor } = processorWith(
      vi.fn<(options: unknown) => Promise<string>>(async () => {
        throw new Error("resend down");
      })
    );

    await expect(processor.processMessage(envelope())).rejects.toThrow(
      "resend down"
    );

    expect(updateEmailById).toHaveBeenCalledWith(emailId, { status: "failed" });
  });

  it("does not resend when the mail was sent but the status write fails", async () => {
    getEmailById.mockResolvedValueOnce({ id: emailId, status: "queued" });
    updateEmailById.mockRejectedValueOnce(new Error("db write failed"));
    const { processor, send } = processorWith();

    const result = await processor.processMessage(envelope());

    expect(send).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ status: "sent", emailId, resendId: "resend-1" });
  });
});

describe("MailQueueProcessor.handleBatch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateEmailById.mockResolvedValue(undefined);
    buildOutboundEmailOptions.mockResolvedValue({
      from: "a@x.com",
      to: ["b@x.com"],
      subject: "s",
      text: "t",
    });
  });

  it("acks invalid messages and retries failures", async () => {
    getEmailById.mockResolvedValue({ id: emailId, status: "queued" });
    const { processor } = processorWith(
      vi.fn<(options: unknown) => Promise<string>>(async () => {
        throw new Error("boom");
      })
    );

    const ack = vi.fn();
    const retry = vi.fn();
    const ackInvalid = vi.fn();
    const batch = {
      queue: "mail-queue",
      messages: [
        { id: "m1", body: { bad: true }, ack: ackInvalid, retry: vi.fn() },
        { id: "m2", body: envelope(), ack, retry },
      ],
    };

    await processor.handleBatch(batch);

    expect(ackInvalid).toHaveBeenCalledTimes(1);
    expect(retry).toHaveBeenCalledTimes(1);
    expect(ack).not.toHaveBeenCalled();
  });

  it("acks a successfully sent message", async () => {
    getEmailById.mockResolvedValue({ id: emailId, status: "queued" });
    const { processor } = processorWith();

    const ack = vi.fn();
    const retry = vi.fn();
    const batch = {
      queue: "mail-queue",
      messages: [{ id: "m1", body: envelope(), ack, retry }],
    };

    await processor.handleBatch(batch);

    expect(ack).toHaveBeenCalledTimes(1);
    expect(retry).not.toHaveBeenCalled();
  });

  it("acks and skips an already-sent message", async () => {
    getEmailById.mockResolvedValue({ id: emailId, status: "sent" });
    const { processor, send } = processorWith();

    const ack = vi.fn();
    const retry = vi.fn();
    const batch = {
      queue: "mail-queue",
      messages: [{ id: "m1", body: envelope(), ack, retry }],
    };

    await processor.handleBatch(batch);

    expect(ack).toHaveBeenCalledTimes(1);
    expect(retry).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });
});
