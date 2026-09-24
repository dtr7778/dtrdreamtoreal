import { NextRequest } from "next/server";

import { QstashReceiptPayload } from "@workspace/lib/qstash";

import { qstashMail } from "@/lib/mail/qstash-mail";
import { getQstashPayload } from "@/lib/qstash/getQstashPayload";
import { verifyQstashSignature } from "@/lib/qstash/verifyQstashSignature";

import { ApiResponseJson } from "@/utils/ApiResponseJson";
import { formatApiError } from "@/utils/formatApiError";

export async function POST(req: NextRequest) {
  try {
    const clonedReq = req.clone();

    await verifyQstashSignature(req);

    const payload = await getQstashPayload<QstashReceiptPayload>(clonedReq);

    await qstashMail.handleMailReceipt(payload.sourceMessageId);

    return ApiResponseJson(true, "success");
  } catch (err) {
    const { message, statusCode } = formatApiError(err);

    return ApiResponseJson(false, message, null, statusCode);
  }
}
