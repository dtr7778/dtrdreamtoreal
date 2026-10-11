export declare const API_MESSAGES: {
    GENERAL: {
        UNAUTHORIZED: string;
        FORBIDDEN: string;
        BAD_REQUEST: string;
        TOO_MANY_REQUESTS: string;
        INPUT_VALIDATION_FAILED: string;
        RESEND: {
            INVALID_REQUEST: string;
            COMPLETED: string;
        };
    };
    UPLOAD: {
        GET_SIGNED_URL: string;
        GET_DOWNLOAD_URL: string;
        CONFIRM_UPLOAD: string;
        ASSIGN_ENTITY: string;
        DELETE: string;
        NOT_CREATE: string;
        NOT_FOUND: string;
        NOT_ALLOWED: string;
        TOO_LARGE: string;
        UNSUPPORTED_TYPE: string;
    };
};
export declare const MAX_UPLOAD_SIZE_BYTES: number;
export declare const IMAGE_UPLOAD_SIZE_BYTES: number;
export declare const IMAGE_MIME_TYPES: readonly ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];
export declare const DEFAULT_UPLOAD_SCOPE = "general";
//# sourceMappingURL=index.d.ts.map