import { auditRouter } from "@/features/audit/api/audit.public.router";
import { authRouter } from "@/features/auth/api/auth.router";
import { companyRouter } from "@/features/company/api/company.router";
import { contactRouter } from "@/features/contact/api/contact.router";
import { notificationRouter } from "@/features/notification/api/notification.router";
import { roleRouter } from "@/features/role/api/role.router";
import { taskRouter } from "@/features/task/api/task.router";
import { uploadRouter } from "@/features/upload/api/upload.router";
import { userRouter } from "@/features/user/api/user.router";

export const router = {
  auth: authRouter,
  audit: auditRouter,
  notification: notificationRouter,
  upload: uploadRouter,
  user: userRouter,
  role: roleRouter,
  task: taskRouter,
  contact: contactRouter,
  company: companyRouter,
};
