import { describe, expect, it } from "vitest";

import { mailQueueEnvelopeSchema } from "./schema";

const valid = {
  emailId: "11111111-1111-4111-8111-111111111111",
  queuedAt: 1_700_000_000_000,
};

describe("mailQueueEnvelopeSchema", () => {
  it("applies defaults for version and isSystemMail", () => {
    const parsed = mailQueueEnvelopeSchema.parse(valid);

    expect(parsed.version).toBe(1);
    expect(parsed.isSystemMail).toBe(true);
    expect(parsed.threadId).toBeUndefined();
  });

  it("accepts an optional threadId", () => {
    const parsed = mailQueueEnvelopeSchema.parse({ ...valid, threadId: "t1" });

    expect(parsed.threadId).toBe("t1");
  });

  it("rejects a non-uuid emailId", () => {
    expect(
      mailQueueEnvelopeSchema.safeParse({ ...valid, emailId: "nope" }).success
    ).toBe(false);
  });

  it("rejects a missing queuedAt", () => {
    expect(
      mailQueueEnvelopeSchema.safeParse({ emailId: valid.emailId }).success
    ).toBe(false);
  });

  it("rejects an unsupported version", () => {
    expect(
      mailQueueEnvelopeSchema.safeParse({ ...valid, version: 2 }).success
    ).toBe(false);
  });
});
