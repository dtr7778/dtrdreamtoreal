import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DatabaseType } from "@workspace/drizzle/client";

import { QueueMailService } from "./QueueMail.service";

const { createOutboundEmailRecord, updateEmailById, threadId } = vi.hoisted(
  () => ({
    createOutboundEmailRecord: vi.fn(),
    updateEmailById: vi.fn(),
    threadId: "22222222-2222-4222-8222-222222222222",
  })
);

vi.mock("../services/Email.service", () => ({
  EmailService: class {
    public extractPrimaryRecipient = () => ({ email: "user@example.com" });
    public createOutboundEmailRecord = createOutboundEmailRecord;
    public updateEmailById = updateEmailById;
  },
}));

vi.mock("../services/EmailThread.service", () => ({
  EmailThreadService: class {
    public findOrCreateThread = async () => threadId;
  },
}));

const emailId = "11111111-1111-4111-8111-111111111111";

function buildService(
  send = vi.fn<(message: unknown) => Promise<unknown>>(async () => ({
    metadata: {},
  }))
) {
  const service = new QueueMailService({
    database: {} as DatabaseType,
    queue: { send },
  });

  return { service, send };
}

describe("QueueMailService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createOutboundEmailRecord.mockResolvedValue({
      emailId,
      threadId: undefined,
    });
    updateEmailById.mockResolvedValue(undefined);
  });

  it("persists the email then enqueues a validated envelope", async () => {
    const { service, send } = buildService();

    const result = await service.sendMail({
      from: "DTR <notification@mail.dtrdreamtoreal.com>",
      to: "user@example.com",
      subject: "Hello",
      text: "Hi there",
    });

    expect(createOutboundEmailRecord).toHaveBeenCalledWith({
      options: expect.objectContaining({ subject: "Hello" }),
      threadId,
    });
    expect(send).toHaveBeenCalledTimes(1);

    const envelope = send.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(envelope).toMatchObject({ version: 1, emailId, isSystemMail: true });
    expect(typeof envelope.queuedAt).toBe("number");

    expect(result).toEqual({ success: true, emailId, threadId });
  });

  it("marks failed when persistence fails", async () => {
    createOutboundEmailRecord.mockRejectedValueOnce(new Error("db down"));
    const { service } = buildService();

    const result = await service.sendMail({
      from: "DTR <notification@mail.dtrdreamtoreal.com>",
      to: "user@example.com",
      subject: "Hello",
      text: "Hi there",
    });

    expect(result).toEqual({ success: false, error: "db down" });
    expect(updateEmailById).not.toHaveBeenCalled();
  });

  it("marks the persisted email failed when enqueueing fails", async () => {
    const { service } = buildService(
      vi.fn<(message: unknown) => Promise<unknown>>(async () => {
        throw new Error("queue down");
      })
    );

    const result = await service.sendMail({
      from: "DTR <notification@mail.dtrdreamtoreal.com>",
      to: "user@example.com",
      subject: "Hello",
      text: "Hi there",
    });

    expect(result).toEqual({ success: false, emailId, error: "queue down" });
    expect(updateEmailById).toHaveBeenCalledWith(emailId, { status: "failed" });
  });
});
