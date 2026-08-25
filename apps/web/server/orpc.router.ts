import { authRouter } from "@/features/auth/api/auth.router";
import { notificationRouter } from "@/features/notification/api/notification.router";
import { uploadRouter } from "@/features/upload/api/upload.router";
import { userRouter } from "@/features/user/api/user.router";

export const router = {
  auth: authRouter,
  notification: notificationRouter,
  upload: uploadRouter,
  user: userRouter,
};
