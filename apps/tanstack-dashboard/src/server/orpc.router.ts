import { chatRouter } from "#/features/chat/api/chat.router";
import { notificationRouter } from "#/features/notification/api/notification.router";
import { roleRouter } from "#/features/role/api/role.router";
import { taskRouter } from "#/features/task/api/task.router";
import { userRouter } from "#/features/user/api/user.router";

export const router = {
  notification: notificationRouter,
  user: userRouter,
  role: roleRouter,
  chat: chatRouter,
  task: taskRouter,
};
