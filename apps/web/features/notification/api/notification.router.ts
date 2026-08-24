import {
  listNotificationProcedure,
  markAsReadProcedure,
  notificationImpl,
  settingsDetailsProcedure,
  subscribePushNotificationProcedure,
  unsubscribePushNotificationProcedure,
  updateSettingsProcedure,
} from "./notification.procedure";

export const notificationRouter = notificationImpl.router({
  list: listNotificationProcedure,
  settings: settingsDetailsProcedure,
  markAsRead: markAsReadProcedure,
  updateSettings: updateSettingsProcedure,
  subscribe: subscribePushNotificationProcedure,
  unsubscribe: unsubscribePushNotificationProcedure,
});
