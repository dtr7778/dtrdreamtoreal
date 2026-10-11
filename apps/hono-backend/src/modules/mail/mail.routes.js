import { createRoute, z } from "@hono/zod-openapi";
import { apiOutputSchema } from "@workspace/lib/zod-schemas";
import { jsonContent, OK } from "@workspace/server-core";
const tags = ["mail"];
export const inboundMailRoute = createRoute({
    method: "post",
    path: "/mail/inbound",
    summary: "Resend inbound mail route",
    tags,
    responses: {
        [OK]: jsonContent(apiOutputSchema(z.object({
            emailId: z.uuid(),
            threadId: z.uuid().optional(),
        })), "Inbound mail"),
    },
});
export const outboundMailRoute = createRoute({
    method: "post",
    path: "/mail/outbound",
    summary: "Resend outbound mail route",
    tags,
    responses: {
        [OK]: jsonContent(apiOutputSchema(z.null()), "Outbound mail"),
    },
});
export const emailEventRoute = createRoute({
    method: "post",
    path: "/mail/email-event",
    summary: "Resend email event route",
    tags,
    responses: {
        [OK]: jsonContent(apiOutputSchema(z.null()), "Mail event"),
    },
});
