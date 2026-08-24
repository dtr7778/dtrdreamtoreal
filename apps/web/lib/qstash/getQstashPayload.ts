import { NextRequest } from "next/server";

import { QstashError } from "@workspace/lib/qstash/error";

export async function getQstashPayload<
  T extends { messageId?: string; sourceMessageId?: string },
>(req: NextRequest | Request): Promise<T & { messageId: string }> {
  try {
    const payload = (await req.json()) as T;

    const messageId =
      payload?.sourceMessageId ||
      payload?.messageId ||
      req.headers.get("upstash-message-id");

    if (!messageId) {
      throw new QstashError(
        "Invalid messageId",
        "QSTASH_INVALID_MESSAGE_ID",
        400
      );
    }

    return { ...payload, messageId };
  } catch {
    throw new QstashError("Invalid JSON", "QSTASH_INVALID_PAYLOAD", 400);
  }
}
