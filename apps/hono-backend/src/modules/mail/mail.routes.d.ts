import { z } from "@hono/zod-openapi";
export declare const inboundMailRoute: {
    method: "post";
    path: "/mail/inbound";
    summary: string;
    tags: string[];
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        message: z.ZodString;
                        success: z.ZodBoolean;
                        data: z.ZodObject<{
                            emailId: z.ZodUUID;
                            threadId: z.ZodOptional<z.ZodUUID>;
                        }, z.core.$strip>;
                    }, z.core.$strip>;
                };
            };
            description: string;
        };
    };
} & {
    getRoutingPath(): "/mail/inbound";
};
export declare const outboundMailRoute: {
    method: "post";
    path: "/mail/outbound";
    summary: string;
    tags: string[];
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        message: z.ZodString;
                        success: z.ZodBoolean;
                        data: z.ZodNull;
                    }, z.core.$strip>;
                };
            };
            description: string;
        };
    };
} & {
    getRoutingPath(): "/mail/outbound";
};
export declare const emailEventRoute: {
    method: "post";
    path: "/mail/email-event";
    summary: string;
    tags: string[];
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        message: z.ZodString;
                        success: z.ZodBoolean;
                        data: z.ZodNull;
                    }, z.core.$strip>;
                };
            };
            description: string;
        };
    };
} & {
    getRoutingPath(): "/mail/email-event";
};
export type InboundMailRouteType = typeof inboundMailRoute;
export type OutboundMailRouteType = typeof outboundMailRoute;
export type EmailEventRouteType = typeof emailEventRoute;
//# sourceMappingURL=mail.routes.d.ts.map