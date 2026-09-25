import { describe, expect, it, vi } from "vitest";

import type {
  BullmqClientServiceConfig,
  IBullmqPublisher,
} from "@workspace/lib/bullmq";
import { createBullmqMail, type TemplateMailPayload } from "@workspace/mail";

function createMailer(overrides?: {
  enqueueBatch?: ReturnType<typeof vi.fn>;
}) {
  const enqueue = vi.fn(async () => ({ messageId: "m1", queue: "mail" }));
  const enqueueBatch =
    overrides?.enqueueBatch ??
    vi.fn(async (request: { payloads: unknown[] }) =>
      request.payloads.map((_payload, index) => ({
        success: true,
        messageId: `m${index}`,
        queue: "mail",
      }))
    );

  const publisher = { enqueue, enqueueBatch } as unknown as IBullmqPublisher;
  const config: BullmqClientServiceConfig = {
    signingSecret: "test-secret",
    publisher,
    defaultRetries: 3,
  };

  return { mailer: createBullmqMail(config), enqueueBatch };
}

const payload: TemplateMailPayload<"welcome"> = {
  template: "welcome",
  data: { userName: "Jane", dashboardUrl: "https://acme.com/dashboard" },
  to: "jane@example.com",
};

describe("BullmqMailService batch", () => {
  it("returns [] and skips the transport for an empty batch", async () => {
    const { mailer, enqueueBatch } = createMailer();

    expect(await mailer.sendBatch([])).toEqual([]);
    expect(await mailer.sendRawBatch([])).toEqual([]);
    expect(enqueueBatch).not.toHaveBeenCalled();
  });

  it("maps per-item batch results", async () => {
    const { mailer, enqueueBatch } = createMailer();

    const results = await mailer.sendBatch([
      payload,
      { ...payload, to: "sam@example.com" },
    ]);

    expect(enqueueBatch).toHaveBeenCalledOnce();
    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({ success: true, messageId: "m0" });
    expect(results[1]).toMatchObject({ success: true, messageId: "m1" });
  });

  it("marks every item failed when the transport throws", async () => {
    const enqueueBatch = vi.fn(async () => {
      throw new Error("network down");
    });
    const { mailer } = createMailer({ enqueueBatch });

    const results = await mailer.sendBatch([payload, payload]);

    expect(results).toHaveLength(2);
    expect(results.every((result) => !result.success)).toBe(true);
    expect(results[0]?.error).toContain("network down");
  });
});
