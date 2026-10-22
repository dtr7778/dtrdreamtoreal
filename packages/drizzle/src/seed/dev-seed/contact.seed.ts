import { faker } from "@faker-js/faker";
import { zocker } from "zocker";

import type { DatabaseType } from "../../clients/drizzle-client";
import type {
  ContactSubmissionDataModel,
  InsertEmail,
  InsertEmailThread,
} from "../../schemas";
import {
  ContactSubmissionTable,
  ContactUserTable,
  EmailTable,
  EmailThreadTable,
  insertContactSubmissionSchema,
  insertContactUserSchema,
} from "../../schemas";
import { insertChunked, insertChunkedReturning } from "../../utils";
import { seedConfigs } from "../seed.config";

export async function seedContacts(
  db: DatabaseType
): Promise<Array<ContactSubmissionDataModel>> {
  console.log("🌱 Seeding contacts...");

  const contactUserData = zocker(
    insertContactUserSchema.omit({
      firstName: true,
      middleName: true,
      lastName: true,
      company: true,
      phone: true,
    })
  )
    .generateMany(seedConfigs.targets.contacts)
    .map((contactUser) => {
      const firstName = faker.person.firstName();
      const middleName = faker.person.middleName();
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
        firstName,
        middleName,
        lastName,
        email,
        company,
        phone,
      };
    });

  const contactUsers = await insertChunkedReturning(contactUserData, (chunk) =>
    db.insert(ContactUserTable).values(chunk).returning()
  );

  const emailThreadsData: Array<InsertEmailThread> = contactUsers.map(
    (contactUser) => {
      return {
        contactEmail: contactUser.email,
        contactName: contactUser.firstName,
        subject: `Te: ${faker.lorem.sentence({ min: 2, max: 4 })}`,
      } satisfies InsertEmailThread;
    }
  );

  const emailThreads = await insertChunkedReturning(emailThreadsData, (chunk) =>
    db.insert(EmailThreadTable).values(chunk).returning()
  );

  const emailsData: Array<InsertEmail> = emailThreads.map((emailThread) => {
    return {
      direction: "outbound",
      status: "delivered",
      threadId: emailThread.id,
      subject: "New contact submitted",
    } satisfies InsertEmail;
  });

  await insertChunked(emailsData, (chunk) =>
    db.insert(EmailTable).values(chunk)
  );

  const contactsData = zocker(
    insertContactSubmissionSchema.omit({
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

  const contacts = await insertChunkedReturning(contactsData, (chunk) =>
    db.insert(ContactSubmissionTable).values(chunk).returning()
  );

  console.log(`✅ ${contacts.length} Contact seeded`);

  return contacts;
}
