import { beforeEach, describe, expect, it, vi } from "vitest";

import { BullMqService } from "./BullMq.service";

const { captureWithContext, withIsolationScope, setTags } = vi.hoisted(() => ({
  captureWithContext: vi.fn(),
  withIsolationScope: vi.fn((cb: () => unknown) => cb()),
  setTags: vi.fn(),
}));

vi.mock("@workspace/sentry/helpers", () => ({
  captureWithContext: (...args: unknown[]) => captureWithContext(...args),
}));

vi.mock("@sentry/node", () => ({
  withIsolationScope: (cb: () => unknown) => withIsolationScope(cb),
  setTags: (...args: unknown[]) => setTags(...args),
  captureException: vi.fn(),
}));

const processorRef = vi.hoisted(() => ({
  current: undefined as
    | ((job: unknown, token?: string, signal?: AbortSignal) => unknown)
    | undefined,
}));

vi.mock("bullmq", () => ({
  Queue: class {},
  Worker: class {
    constructor(_name: string, fn: (job: unknown) => unknown) {
      processorRef.current = fn;
    }
    on() {}
    close() {}
  },
}));

vi.mock("./MetadataExtractor.service", () => ({
  MetadataExtractorService: {
    extractWorkerMetadata: () => ({
      definition: { queueName: "mail", workerOptions: {} },
      workerInstance: {
        handle: vi.fn().mockRejectedValue(new Error("job boom")),
      },
      workerNodes: [{ methodName: "handle", jobName: undefined }],
      workerEvents: [],
      workerClass: { name: "MailWorker" },
    }),
  },
}));

describe("BullMqService sentry capture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    processorRef.current = undefined;
  });

  it("captures a failing job exactly once and rethrows", async () => {
    const service = new BullMqService({
      container: {} as never,
      connection: {},
    });

    service.createWorkers([class MailWorker {}] as never);

    const processor = processorRef.current!;
    const job = { id: "1", name: "send", attemptsMade: 0 };

    await expect(processor(job)).rejects.toThrow("job boom");

    expect(withIsolationScope).toHaveBeenCalledTimes(1);
    expect(captureWithContext).toHaveBeenCalledTimes(1);
    expect(captureWithContext).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        app: "worker",
        tags: expect.objectContaining({ queue: "mail", job: "send" }),
      })
    );
  });
});
