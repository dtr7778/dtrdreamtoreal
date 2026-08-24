import { NextRequest } from "next/server";

import { QstashError } from "@workspace/lib/qstash/error";

import { API_MESSAGES } from "@/constants/apiMessage";

import { qstashClient } from "./qstash-client";

export async function verifyQstashSignature(req: NextRequest | Request) {
  const body = await req.text();
  const signature = req.headers.get("upstash-signature");

  if (!signature) {
    throw new QstashError(
      API_MESSAGES.GENERAL.QSTASH.INVALID_SIGNATURE,
      "QSTASH_SIGNATURE_INVALID",
      401
    );
  }

  const isValid = await qstashClient.verifySignature(body, signature, req.url);

  if (!isValid) {
    throw new QstashError(
      API_MESSAGES.GENERAL.QSTASH.INVALID_SIGNATURE,
      "QSTASH_SIGNATURE_INVALID",
      401
    );
  }
}
