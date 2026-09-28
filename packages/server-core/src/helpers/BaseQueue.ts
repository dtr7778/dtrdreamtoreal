import { createHash } from "node:crypto";

export abstract class BaseQueue {
  protected toJobId(deduplicationId: string | undefined): string | undefined {
    if (deduplicationId) {
      return createHash("sha1").update(deduplicationId).digest("hex");
    }
    return undefined;
  }
}
