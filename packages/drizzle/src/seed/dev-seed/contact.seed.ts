import { faker } from "@faker-js/faker";
import { zocker } from "zocker";

import {
  ContactSubmissionDataModel,
  ContactSubmissionTable,
  ContactUserTable,
  EmailTable,
  EmailThreadTable,
  insertContactSubmissionSchema,
  insertContactUserSchema,
  InsertEmail,
  InsertEmailThread,
} from "../../schemas";
import { db } from "../seed-db-client";
import { seedConfigs } from "../seed.config";

export async function seedContacts(): Promise<
  Array<ContactSubmissionDataModel>
> {
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
      const email = faker.internet.email({ firstName, lastName });

      return {
        ...contactUser,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        email,
        company,
        phone,
      };
    });

  const contactUsers = await db
    .insert(ContactUserTable)
    .values(contactUserData)
    .returning();

  const emailThreadsData: Array<InsertEmailThread> = contactUsers.map(
    (contactUser) => {
      return {
        contactEmail: contactUser.email,
        contactName: contactUser.name,
        subject: `Te: ${faker.lorem.sentence({ min: 2, max: 4 })}`,
      } satisfies InsertEmailThread;
    }
  );

  const emailThreads = await db
    .insert(EmailThreadTable)
    .values(emailThreadsData)
    .returning();

  const emailsData: Array<InsertEmail> = emailThreads.map((emailThread) => {
    return {
      direction: "outbound",
      status: "delivered",
      threadId: emailThread.id,
      subject: "New contact submitted",
    } satisfies InsertEmail;
  });

  await db.insert(EmailTable).values(emailsData);

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
    .map((contact, idx) => {
      const contactUser = faker.helpers.arrayElement(contactUsers);
      const emailThread = emailThreads[idx]!;
      const userAgent = faker.lorem.sentences({ min: 1, max: 3 });
      const message = faker.lorem.sentences({ min: 1, max: 3 });
      const subject = faker.lorem.sentence({ min: 2, max: 4 });

      return {
        ...contact,
        emailThreadId: emailThread.id,
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

  console.log(`✅ ${contacts.length} Contact seeded`);

  return contacts;
}
