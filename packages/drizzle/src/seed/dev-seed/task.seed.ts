import { faker } from "@faker-js/faker";
import { zocker } from "zocker";

import {
  insertTaskSchema,
  TaskDataModel,
  TaskTable,
  UserDataModel,
} from "../../schemas";
import { db } from "../seed-db-client";
import { seedConfigs } from "../seed.config";

export async function seedTasks(
  users: Array<UserDataModel>
): Promise<Array<TaskDataModel>> {
  console.log("🌱 Seeding tasks...");

  const tasksData = zocker(insertTaskSchema)
    .generateMany(seedConfigs.targets.tasks)
    .map((task) => {
      const createdUser = faker.helpers.arrayElement(users);
      const title = faker.lorem.sentence({ min: 2, max: 6 });
      const description = faker.helpers.maybe(
        () => {
          return faker.lorem.sentences(2);
        },
        { probability: 0.2 }
      );

      const potentialAssignedUser = users.filter(
        (user) => user.id !== createdUser.id
      );

      const assignedUser =
        potentialAssignedUser.length > 0
          ? faker.helpers.maybe(
              () => faker.helpers.arrayElement(potentialAssignedUser),
              { probability: 0.5 }
            )
          : undefined;

      return {
        ...task,
        title,
        description,
        createdBy: createdUser.id,
        assignedBy: assignedUser ? assignedUser.id : null,
      };
    });

  const tasks = await db.insert(TaskTable).values(tasksData).returning();

  console.log(`✅ ${tasks.length} Task seeded`);

  return tasks;
}
