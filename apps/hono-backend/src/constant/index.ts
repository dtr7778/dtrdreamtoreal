export const API_MESSAGES = {
  GENERAL: {
    UNAUTHORIZED: "Please login to continue.",
    FORBIDDEN: "You don't have permission to perform this action.",
    BAD_REQUEST: "Invalid request. Please check your input and try again.",
    TOO_MANY_REQUESTS: "Too many requests. Please try again later.",
    INPUT_VALIDATION_FAILED: "Please check your input and fix any errors.",
    RESEND: {
      INVALID_REQUEST: "Invalid request",
      COMPLETED: "Successfully completed",
    },
  },
  UPLOAD: {
    GET_SIGNED_URL: "Upload URL generated successfully.",
    GET_DOWNLOAD_URL: "Download URL generated successfully.",
    CONFIRM_UPLOAD: "Upload confirmed successfully.",
    ASSIGN_ENTITY: "File attached successfully.",
    DELETE: "File deleted successfully.",
    NOT_CREATE: "Failed to create upload. Please try again.",
    NOT_FOUND: "File not found.",
    NOT_ALLOWED: "You don't have permission to access this file.",
    TOO_LARGE: "File is too large.",
    UNSUPPORTED_TYPE: "This file type is not allowed.",
  },
};

export const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
export const IMAGE_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
] as const;

export const DEFAULT_UPLOAD_SCOPE = "general";
