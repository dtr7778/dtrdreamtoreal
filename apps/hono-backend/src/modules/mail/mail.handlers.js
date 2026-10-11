import { asc, eq, inArray } from "drizzle-orm";
import { Resend } from "resend";
import { createDrizzleClient, } from "@workspace/drizzle/client";
import { EmailTable } from "@workspace/drizzle/schemas";
import { EmailService } from "@workspace/mail";
import { ApiError, apiResponse, BAD_REQUEST, OK, UNAUTHORIZED, } from "@workspace/server-core";
import { getEnv } from "@/lib/env";
import { API_MESSAGES } from "@/constant";
const WEBHOOK_SECRETS = {
    inbound: getEnv("RESEND_INBOUND_WEBHOOK_SECRET"),
    outbound: getEnv("RESEND_OUTBOUND_WEBHOOK_SECRET"),
    emailEvent: getEnv("RESEND_EVENT_WEBHOOK_SECRET"),
};
async function getWebhookEvent(resend, req, channel) {
    const id = req.header("svix-id");
    const timestamp = req.header("svix-timestamp");
    const signature = req.header("svix-signature");
    let payload;
    try {
        payload = await req.text();
    }
    catch {
        throw new ApiError({
            statusCode: BAD_REQUEST,
            message: API_MESSAGES.GENERAL.RESEND.INVALID_REQUEST,
        });
    }
    if (!id || !timestamp || !signature || !payload) {
        throw new ApiError({
            statusCode: BAD_REQUEST,
            message: API_MESSAGES.GENERAL.RESEND.INVALID_REQUEST,
        });
    }
    try {
        return resend.webhooks.verify({
            payload,
            headers: { id, timestamp, signature },
            webhookSecret: WEBHOOK_SECRETS[channel],
        });
    }
    catch {
        throw new ApiError({
            statusCode: UNAUTHORIZED,
            message: API_MESSAGES.GENERAL.RESEND.INVALID_REQUEST,
        });
    }
}
function cleanMessageId(messageId) {
    return messageId.replace(/^<|>$/g, "");
}
async function resolveInboundThreadId(database, payload) {
    const inReplyTo = payload.headers?.["in-reply-to"];
    if (inReplyTo) {
        const [originalEmail] = await database
            .select({ threadId: EmailTable.threadId })
            .from(EmailTable)
            .where(eq(EmailTable.resendMessageId, cleanMessageId(inReplyTo)))
            .limit(1);
        if (originalEmail?.threadId)
            return originalEmail.threadId;
    }
    if (!payload.headers?.references)
        return undefined;
    const referenceIds = payload.headers.references
        .split(/\s+/)
        .map(cleanMessageId)
        .filter(Boolean);
    const [email] = await database
        .select({ threadId: EmailTable.threadId })
        .from(EmailTable)
        .where(inArray(EmailTable.resendMessageId, referenceIds))
        .orderBy(asc(EmailTable.createdAt))
        .limit(1);
    return email?.threadId ?? undefined;
}
export const inboundMailHandler = async (c) => {
    const resend = new Resend(getEnv("RESEND_API_KEY"));
    const eventPayload = await getWebhookEvent(resend, c.req, "inbound");
    if (eventPayload.type !== "email.received") {
        throw new ApiError({
            statusCode: BAD_REQUEST,
            message: API_MESSAGES.GENERAL.RESEND.INVALID_REQUEST,
        });
    }
    const { data, error } = await resend.emails.receiving.get(eventPayload.data.email_id);
    if (error || !data) {
        throw new ApiError({
            statusCode: error.statusCode ?? UNAUTHORIZED,
            message: error.message ?? API_MESSAGES.GENERAL.RESEND.INVALID_REQUEST,
        });
    }
    const database = createDrizzleClient(c.env.DB);
    const threadId = await resolveInboundThreadId(database, data);
    const emailservice = new EmailService(database);
    const { emailId } = await emailservice.createInboundEmailRecord({
        ...data,
        message_id: cleanMessageId(data.message_id),
        threadId,
    }, database);
    return apiResponse(c, {
        success: true,
        statusCode: OK,
        message: API_MESSAGES.GENERAL.RESEND.COMPLETED,
        data: { emailId, threadId },
    });
};
export const outboundMailHandler = async (c) => {
    const resend = new Resend(getEnv("RESEND_API_KEY"));
    const eventPayload = await getWebhookEvent(resend, c.req, "outbound");
    if (eventPayload.type !== "email.delivered") {
        throw new ApiError({
            statusCode: BAD_REQUEST,
            message: API_MESSAGES.GENERAL.RESEND.INVALID_REQUEST,
        });
    }
    const database = createDrizzleClient(c.env.DB);
    const emailservice = new EmailService(database);
    await emailservice.updateEmailByResendId(eventPayload.data.email_id, {
        status: "delivered",
    }, database);
    return apiResponse(c, {
        success: true,
        statusCode: OK,
        message: API_MESSAGES.GENERAL.RESEND.COMPLETED,
        data: null,
    });
};
export const emailEventHandler = async (c) => {
    const resend = new Resend(getEnv("RESEND_API_KEY"));
    const eventPayload = await getWebhookEvent(resend, c.req, "emailEvent");
    const database = createDrizzleClient(c.env.DB);
    const emailService = new EmailService(database);
    switch (eventPayload.type) {
        case "email.sent":
            await emailService.updateEmailByResendId(eventPayload.data.email_id, {
                status: "sent",
                resendMessageId: cleanMessageId(eventPayload.data.message_id),
            }, database);
            break;
        case "email.failed":
            await emailService.updateEmailByResendId(eventPayload.data.email_id, {
                status: "failed",
            }, database);
            break;
        case "email.bounced":
            await emailService.updateEmailByResendId(eventPayload.data.email_id, {
                status: "bounced",
            }, database);
            break;
        case "email.complained":
            await emailService.updateEmailByResendId(eventPayload.data.email_id, {
                status: "complained",
            }, database);
            break;
        case "email.suppressed":
            await emailService.updateEmailByResendId(eventPayload.data.email_id, {
                status: "suppressed",
            }, database);
            break;
        case "email.delivery_delayed":
            await emailService.updateEmailByResendId(eventPayload.data.email_id, {
                status: "delivery_delayed",
            }, database);
            break;
        default:
            throw new ApiError({
                statusCode: BAD_REQUEST,
                message: API_MESSAGES.GENERAL.RESEND.INVALID_REQUEST,
            });
    }
    return apiResponse(c, {
        success: true,
        statusCode: OK,
        message: API_MESSAGES.GENERAL.RESEND.COMPLETED,
        data: null,
    });
};
