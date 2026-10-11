import { z } from "@hono/zod-openapi";
export declare const getFileRoute: {
    method: "get";
    path: "/files/{id}";
    tags: string[];
    summary: string;
    request: {
        params: z.ZodObject<{
            id: z.ZodUUID;
        }, z.core.$strip>;
    };
    responses: {
        200: {
            description: string;
            headers: z.ZodObject<{
                "Content-Type": z.ZodString;
                "Content-Length": z.ZodString;
                "Content-Range": z.ZodOptional<z.ZodString>;
                "Cache-Control": z.ZodString;
                ETag: z.ZodString;
            }, z.core.$strip>;
            content: {
                "application/octet-stream": {
                    schema: z.ZodString;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/files/:id";
};
export declare const getUploadUrlRoute: {
    method: "post";
    path: "/upload/signed-url";
    tags: string[];
    summary: string;
    middleware: [import("hono").MiddlewareHandler<import("../../types").AuthenticatedBindings>];
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        filename: z.ZodString;
                        mimeType: z.ZodString;
                        size: z.ZodNumber;
                        entityType: z.ZodOptional<z.ZodEnum<{
                            profile_image: "profile_image";
                            audit_report_image: "audit_report_image";
                        }>>;
                        entityId: z.ZodOptional<z.ZodString>;
                        scope: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>;
                };
            };
            description: string;
        };
    };
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        message: z.ZodString;
                        success: z.ZodBoolean;
                        data: z.ZodObject<{
                            key: z.ZodString;
                            uploadUrl: z.ZodString;
                            expiresIn: z.ZodNumber;
                        }, z.core.$strip>;
                    }, z.core.$strip>;
                };
            };
            description: string;
        };
    };
} & {
    getRoutingPath(): "/upload/signed-url";
};
export declare const confirmUploadRoute: {
    method: "post";
    path: "/upload/confirm";
    summary: string;
    tags: string[];
    middleware: [import("hono").MiddlewareHandler<import("../../types").AuthenticatedBindings>];
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        key: z.ZodString;
                        filename: z.ZodString;
                        originalName: z.ZodString;
                        mimeType: z.ZodString;
                        size: z.ZodNumber;
                        entityType: z.ZodOptional<z.ZodEnum<{
                            profile_image: "profile_image";
                            audit_report_image: "audit_report_image";
                        }>>;
                        entityId: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>;
                };
            };
            description: string;
        };
    };
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        message: z.ZodString;
                        success: z.ZodBoolean;
                        data: z.ZodObject<{
                            deletedAt: z.ZodNullable<z.ZodDate>;
                            deletedBy: z.ZodNullable<z.ZodString>;
                            id: z.ZodString;
                            key: z.ZodString;
                            filename: z.ZodString;
                            originalName: z.ZodString;
                            mimeType: z.ZodString;
                            size: z.ZodInt;
                            url: z.ZodString;
                            uploadedBy: z.ZodNullable<z.ZodString>;
                            entityId: z.ZodNullable<z.ZodString>;
                            uploadedAt: z.ZodDate;
                            entityType: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                                profile_image: "profile_image";
                                audit_report_image: "audit_report_image";
                            }>>>;
                        }, {
                            out: {};
                            in: {};
                        }>;
                    }, z.core.$strip>;
                };
            };
            description: string;
        };
    };
} & {
    getRoutingPath(): "/upload/confirm";
};
export declare const assignEntityRoute: {
    method: "post";
    path: "/upload/assign";
    summary: string;
    tags: string[];
    middleware: [import("hono").MiddlewareHandler<import("../../types").AuthenticatedBindings>];
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        fileId: z.ZodUUID;
                        entityType: z.ZodEnum<{
                            profile_image: "profile_image";
                            audit_report_image: "audit_report_image";
                        }>;
                        entityId: z.ZodString;
                    }, z.core.$strip>;
                };
            };
            description: string;
        };
    };
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        message: z.ZodString;
                        success: z.ZodBoolean;
                        data: z.ZodObject<{
                            deletedAt: z.ZodNullable<z.ZodDate>;
                            deletedBy: z.ZodNullable<z.ZodString>;
                            id: z.ZodString;
                            key: z.ZodString;
                            filename: z.ZodString;
                            originalName: z.ZodString;
                            mimeType: z.ZodString;
                            size: z.ZodInt;
                            url: z.ZodString;
                            uploadedBy: z.ZodNullable<z.ZodString>;
                            entityId: z.ZodNullable<z.ZodString>;
                            uploadedAt: z.ZodDate;
                            entityType: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                                profile_image: "profile_image";
                                audit_report_image: "audit_report_image";
                            }>>>;
                        }, {
                            out: {};
                            in: {};
                        }>;
                    }, z.core.$strip>;
                };
            };
            description: string;
        };
    };
} & {
    getRoutingPath(): "/upload/assign";
};
export declare const deleteFileRoute: {
    method: "post";
    path: "/upload/delete";
    summary: string;
    tags: string[];
    middleware: [import("hono").MiddlewareHandler<import("../../types").AuthenticatedBindings>];
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        fileId: z.ZodUUID;
                    }, z.core.$strip>;
                };
            };
            description: string;
        };
    };
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
    getRoutingPath(): "/upload/delete";
};
export type GetFileRouteType = typeof getFileRoute;
export type GetUploadUrlRouteType = typeof getUploadUrlRoute;
export type ConfirmUploadRouteType = typeof confirmUploadRoute;
export type AssignEntityRouteType = typeof assignEntityRoute;
export type DeleteFileRouteType = typeof deleteFileRoute;
//# sourceMappingURL=upload.routes.d.ts.map