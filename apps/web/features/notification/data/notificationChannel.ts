export const NOTIFICATION_EVENT = "new_notifications" as const;

export function notificationChannel(recipientId: string) {
  return `notifications:${recipientId}` as const;
}
