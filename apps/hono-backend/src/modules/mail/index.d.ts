import type { ApiVariables } from "@/types";
declare const router: import("@hono/zod-openapi").OpenAPIHono<import("@workspace/server-core").AppBindings<Env, ApiVariables>, {
    "/mail/inbound": {
        $post: {
            input: {};
            output: {
                message: string;
                success: boolean;
                data: {
                    emailId: string;
                    threadId?: string | undefined;
                };
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/mail/outbound": {
        $post: {
            input: {};
            output: {
                message: string;
                success: boolean;
                data: null;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/mail/email-event": {
        $post: {
            input: {};
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