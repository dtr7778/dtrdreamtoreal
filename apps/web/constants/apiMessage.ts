export const API_MESSAGES = {
  GENERAL: {
    UNAUTHORIZED: "Please login to continue.",
    FORBIDDEN: "You don't have permission to perform this action.",
    BAD_REQUEST: "Invalid request. Please check your input and try again.",
    TOO_MANY_REQUESTS: "Too many requests. Please try again later.",
    INPUT_VALIDATION_FAILED: "Please check your input and fix any errors.",
    QSTASH: {
      INVALID_SIGNATURE: "Invalid request signature. Access denied.",
    },
  },
  AUTH: {
    REQUEST_RESET_PASSWORD: "Password reset link has been sent to your email.",
    METADATA: "Auth metadata loaded successfully.",
    BAN: "User has been banned successfully.",
    UNBAN: "User has been unbanned successfully.",
  },
  NOTIFICATION: {
    GET_NOTIFICATIONS: "Notifications loaded successfully.",
    GET_SETTINGS: "Notification settings loaded successfully.",
    UPDATE_SETTINGS: "Notification settings updated successfully.",
    MARK_AS_READ: "Notification marked as read.",
    SUBSCRIBE_PUSH: "Successfully subscribed to push notifications.",
    UNSUBSCRIBE_PUSH: "Successfully unsubscribed from push notifications.",
  },
};
