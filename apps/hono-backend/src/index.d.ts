import { WorkerEntrypoint } from "cloudflare:workers";
/**
 * RPC entrypoint
 */
export declare class AuthEntrypoint extends WorkerEntrypoint<Env> {
    getSession(headers: Headers): Promise<{
        session: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            expiresAt: Date;
            token: string;
            ipAddress?: string | null | undefined | undefined;
            userAgent?: string | null | undefined | undefined;
            impersonatedBy?: string | null | undefined;
        };
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            emailVerified: boolean;
            name: string;
            image?: string | null | undefined | undefined;
            timezone?: string | null | undefined;
            locale?: string | null | undefined;
            currency?: string | null | undefined;
            banned: boolean | null | undefined;
            role?: string | null | undefined;
            banReason?: string | null | undefined;
            banExpires?: Date | null | undefined;
        };
    } | null>;
    updateUser(data: {
        name?: string | undefined;
        currency?: string | null | undefined;
        image?: string | null | undefined;
        local?: string | null | undefined;
        timezone?: string | null | undefined;
    }, headers: Headers): Promise<{
        status: boolean;
    }>;
    listSessions(headers: Headers): Promise<import("better-auth").Prettify<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        expiresAt: Date;
        token: string;
        ipAddress?: string | null | undefined | undefined;
        userAgent?: string | null | undefined | undefined;
        impersonatedBy?: string | null | undefined;
    }>[]>;
    listUserAccounts(headers: Headers): Promise<{
        scopes: string[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        providerId: string;
        accountId: string;
    }[]>;
}
declare const _default: {
    fetch: (request: Request, env?: {} | Env | undefined, executionCtx?: import("hono").ExecutionContext) => Response | Promise<Response>;
    queue(batch: MessageBatch<unknown>, env: Env): Promise<void>;
};
export default _default;
//# sourceMappingURL=index.d.ts.map