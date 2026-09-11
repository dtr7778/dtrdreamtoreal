import { faker } from "@faker-js/faker";
import { zocker } from "zocker";

import {
  ContactSubmissionDataModel,
  ContactSubmissionReplyTable,
  ContactSubmissionTable,
  ContactUserTable,
  InsertContactSubmissionReply,
  insertContactSubmissionSchema,
  insertContactUserSchema,
  UserDataModel,
} from "../../schemas";
import { db } from "../seed-db-client";
import { seedConfigs } from "../seed.config";

export async function seedContacts(
  users: Array<UserDataModel>
): Promise<Array<ContactSubmissionDataModel>> {
  console.log("🌱 Seeding contacts...");

  const contactUserData = zocker(
    insertContactUserSchema.omit({
      metadata: true,
      name: true,
      firstName: true,
      lastName: true,
      company: true,
      phone: true,
    })
  )
    .generateMany(seedConfigs.targets.contacts)
    .map((contactUser) => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const company = faker.helpers.maybe(
        () => {
          return faker.company.name();
        },
        { probability: 0.4 }
      );
      const phone = faker.helpers.maybe(
        () => {
          return faker.phone.number({ style: "national" });
        },
        { probability: 0.3 }
      );

      return {
        ...contactUser,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        company,
        phone,
      };
    });

  const contactUsers = await db
    .insert(ContactUserTable)
    .values(contactUserData)
    .returning();

  const contactsData = zocker(
    insertContactSubmissionSchema.omit({
      metadata: true,
      message: true,
      subject: true,
      userAgent: true,
      contactUserId: true,
    })
  )
    .generateMany(seedConfigs.targets.contacts)
    .map((contact) => {
      const contactUser = faker.helpers.arrayElement(contactUsers);
      const userAgent = faker.lorem.sentences({ min: 1, max: 3 });
      const message = faker.lorem.sentences({ min: 1, max: 3 });
      const subject = faker.lorem.sentence({ min: 2, max: 4 });

      return {
        ...contact,
        message,
        subject,
        userAgent,
        contactUserId: contactUser.id,
      };
    });

  const contacts = await db
    .insert(ContactSubmissionTable)
    .values(contactsData)
    .returning();

  const replysData: Array<InsertContactSubmissionReply> = Array.from({
    length: 100,
  }).map(() => {
    const user = faker.helpers.arrayElement(users);
    const contact = faker.helpers.arrayElement(contacts);
    const reply = faker.lorem.sentences({ min: 1, max: 4 });

    return {
      reply,
      repliedBy: user.id,
      submissionId: contact.id,
    };
  });

  await db.insert(ContactSubmissionReplyTable).values(replysData);

  console.log(`✅ ${contacts.length} Contact seeded`);

  return contacts;
}
