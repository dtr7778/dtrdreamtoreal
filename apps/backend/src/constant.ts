export const API_MESSAGE = {
  GENERAL: {
    RESEND: {
      INVALID_REQUEST: "Invalid request",
      COMPLETED: "Successfully completed",
    },
    BULLMQ: {
      INVALID_SIGNATURE: "Invalid BullMQ signature",
      FORBIDDEN: "Forbidden access",
    },
  },
  SITE_AUDIT: {
    GET_ALL: "Site audits fetched successfully",
    GET_ALL_AUDIT_ITEM: "Site Audit items fetched successfully",
    GET_RESULT: "Site Audit results fetched successfully",
    GET: "Site audit fetched successfully",
    CREATE: "Site audit created successfully",
    UPDATE: "Site audit updated successfully",
    DELETE: "Site audit deleted successfully",
    NOT_FOUND: "Site audit not found",
    NOT_CREATE: "Failed to create site audit",
    CWV: {
      GET_ALL: "CWV history fetched successfully",
      GET_LATEST: "Latest CWV snapshots fetched successfully",
    },
  },
  AUDIT: {
    GET_ALL: "Audit runs fetched successfully",
    NOT_CREATE: "Failed to create site audit run",
  },
  MAIL: {
    JOB_ENQUEU: "Mail job enqueued",
    WEBHOOK_QUEUED: "Mail webhook queued",
  },
};
