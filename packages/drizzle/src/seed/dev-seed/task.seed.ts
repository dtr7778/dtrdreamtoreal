import { faker } from "@faker-js/faker";
import { zocker } from "zocker";

import type { DatabaseType } from "../../clients/drizzle-client";
import type {
  CompanyTaskDataModel,
  PersonalTaskDataModel,
  UserDataModel,
} from "../../schemas";
import {
  CompanyTaskTable,
  insertCompanyTaskSchema,
  insertPersonalTaskSchema,
  PersonalTaskTable,
} from "../../schemas";
import { insertChunkedReturning } from "../seed-utils";
import { seedConfigs } from "../seed.config";

export async function seedCompanyTasks(
  db: DatabaseType,
  users: Array<UserDataModel>
): Promise<Array<CompanyTaskDataModel>> {
  console.log("🌱 Seeding company tasks...");

  const tasksData = zocker(
    insertCompanyTaskSchema.omit({
      title: true,
      description: true,
      createdBy: true,
      updatedBy: true,
      assigneeId: true,
      assignedById: true,
      source: true,
      externalId: true,
      metadata: true,
    })
  )
    .generateMany(seedConfigs.targets.companyTasks)
    .map((task) => {
      const source = faker.helpers.weightedArrayElement([
        { value: "manual" as const, weight: 6 },
        { value: "mcp" as const, weight: 1 },
        { value: "webhook" as const, weight: 2 },
        { value: "system" as const, weight: 1 },
      ]);
      const isExternal = source !== "manual";
      const createdUser = faker.helpers.arrayElement(users);
      const title = faker.lorem.sentence({ min: 2, max: 6 });
      const description = faker.helpers.maybe(() => faker.lorem.sentences(2), {
        probability: 0.2,
      });

      const potentialAssignees = users.filter(
        (user) => user.id !== createdUser.id
      );

      const assignee =
        potentialAssignees.length > 0
          ? faker.helpers.maybe(
              () => faker.helpers.arrayElement(potentialAssignees),
              { probability: 0.7 }
            )
          : undefined;

      return {
        ...task,
        title,
        description,
        source,
        externalId: isExternal ? faker.string.uuid() : null,
        metadata: isExternal ? { seeded: true, origin: source } : null,
        createdBy: source === "system" ? null : createdUser.id,
        updatedBy: null,
        assigneeId: assignee ? assignee.id : null,
        assignedById: assignee ? createdUser.id : null,
      };
    });

  const tasks = await insertChunkedReturning(tasksData, (chunk) =>
    db.insert(CompanyTaskTable).values(chunk).returning()
  );

  console.log(`✅ ${tasks.length} company tasks seeded`);

  return tasks;
}

export async function seedPersonalTasks(
  db: DatabaseType,
  users: Array<UserDataModel>
): Promise<Array<PersonalTaskDataModel>> {
  console.log("🌱 Seeding personal tasks...");

  const tasksData = zocker(
    insertPersonalTaskSchema.omit({
      title: true,
      description: true,
      userId: true,
      sortOrder: true,
      source: true,
      externalId: true,
      metadata: true,
    })
  )
    .generateMany(seedConfigs.targets.personalTasks)
    .map((task, index) => {
      const owner = faker.helpers.arrayElement(users);
      const isExternal = faker.datatype.boolean({ probability: 0.2 });

      return {
        ...task,
        userId: owner.id,
        title: faker.lorem.sentence({ min: 2, max: 6 }),
        description: faker.helpers.maybe(() => faker.lorem.sentences(2), {
          probability: 0.3,
        }),
        sortOrder: index,
        source: isExternal ? ("mcp" as const) : ("manual" as const),
        externalId: isExternal ? faker.string.uuid() : null,
        metadata: isExternal ? { seeded: true, origin: "mcp" } : null,
      };
    });

  const tasks = await insertChunkedReturning(tasksData, (chunk) =>
    db.insert(PersonalTaskTable).values(chunk).returning()
  );

  console.log(`✅ ${tasks.length} personal tasks seeded`);

  return tasks;
}
