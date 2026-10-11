import type { AuthSession, AuthType, AuthUser } from "@workspace/auth";
export declare function getAuthUser(auth: AuthType, headers: Headers): Promise<{
    user: AuthUser;
    session: AuthSession;
}>;
//# sourceMappingURL=getAuthUser.d.ts.map