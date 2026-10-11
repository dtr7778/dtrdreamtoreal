import type { ApiVariables } from "@/types";
declare const router: import("@hono/zod-openapi").OpenAPIHono<import("@workspace/server-core").AppBindings<Env, ApiVariables>, {
    "/files/:id": {
        $get: {
            input: {
                param: {
                    id: string;
                };
            };
            output: Response;
            outputFormat: "json";
            status: import("hono/utils/http-status").StatusCode;
        };
    };
} & {
    "/upload/signed-url": {
        $post: {
            input: {
                json: {
                    filename: string;
                    mimeType: string;
                    size: number;
                    entityType?: "profile_image" | "audit_report_image" | undefined;
                    entityId?: string | undefined;
                    scope?: string | undefined;
                };
            };
            output: {
                message: string;
                success: boolean;
                data: {
                    key: string;
                    uploadUrl: string;
                    expiresIn: number;
                };
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/upload/confirm": {
        $post: {
            input: {
                json: {
                    key: string;
                    filename: string;
                    originalName: string;
                    mimeType: string;
                    size: number;
                    entityType?: "profile_image" | "audit_report_image" | undefined;
                    entityId?: string | undefined;
                };
            };
            output: {
                message: string;
                success: boolean;
                data: {
                    deletedAt: string | null;
                    deletedBy: string | null;
                    id: string;
                    key: string;
                    filename: string;
                    originalName: string;
                    mimeType: string;
                    size: number;
                    url: string;
                    uploadedBy: string | null;
                    entityId: string | null;
                    uploadedAt: string;
                    entityType?: "profile_image" | "audit_report_image" | null | undefined;
                };
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/upload/assign": {
        $post: {
            input: {
                json: {
                    fileId: string;
                    entityType: "profile_image" | "audit_report_image";
                    entityId: string;
                };
            };
            output: {
                message: string;
                success: boolean;
                data: {
                    deletedAt: string | null;
                    deletedBy: string | null;
                    id: string;
                    key: string;
                    filename: string;
                    originalName: string;
                    mimeType: string;
                    size: number;
                    url: string;
                    uploadedBy: string | null;
                    entityId: string | null;
                    uploadedAt: string;
                    entityType?: "profile_image" | "audit_report_image" | null | undefined;
                };
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/upload/delete": {
        $post: {
            input: {
                json: {
                    fileId: string;
                };
            };
            output: {
                message: string;
                success: boolean;
                data: null;
            };
            outputFormat: "json";
            status: 200;
        };
    };
}, "/">;
export default router;
//# sourceMappingURL=index.d.ts.map