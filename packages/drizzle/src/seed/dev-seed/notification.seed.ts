import { faker } from "@faker-js/faker";
import { zocker } from "zocker";

import {
  insertNotificationSchema,
  NotificationDataModel,
  NotificationTable,
  UserDataModel,
} from "../../schemas";
import { db } from "../seed-db-client";
import { seedConfigs } from "../seed.config";

export async function seedNotifications(
  users: Array<UserDataModel>
): Promise<Array<NotificationDataModel>> {
  console.log("🌱 Seeding notifications...");

  const notificationsData = zocker(
    insertNotificationSchema.omit({
      data: true,
      title: true,
      message: true,
      recipientId: true,
      actorId: true,
    })
  )
    .generateMany(seedConfigs.targets.notifications)
    .map((notification) => {
      const recipient = faker.helpers.arrayElement(users);
      const title = faker.lorem.sentence({ min: 2, max: 4 });
      const message = faker.lorem.sentence({ min: 2, max: 6 });

      const potentialActors = users.filter((user) => user.id !== recipient.id);

      const actor =
        potentialActors.length > 0
          ? faker.helpers.maybe(
              () => faker.helpers.arrayElement(potentialActors),
              { probability: 0.5 }
            )
          : undefined;

      return {
        ...notification,
        title,
        message,
        recipientId: recipient.id,
        actorId: actor ? actor.id : null,
      };
    });

  const notifications = await db
    .insert(NotificationTable)
    .values(notificationsData)
    .returning();

  console.log(`✅ ${notifications.length} Notification seeded`);

  return notifications;
}
