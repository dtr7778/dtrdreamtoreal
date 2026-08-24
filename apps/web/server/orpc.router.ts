import { authRouter } from "@/features/auth/api/auth.router";
import { notificationRouter } from "@/features/notification/api/notification.router";

export const router = {
  auth: authRouter,
  notification: notificationRouter,
};
