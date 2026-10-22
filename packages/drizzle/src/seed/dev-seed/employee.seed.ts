import { faker } from "@faker-js/faker";
import { zocker } from "zocker";

import type { DatabaseType } from "../../clients/drizzle-client";
import type {
  InsertLeadUser,
  InsertLeadUserAddress,
  InsertLeadUserSocial,
  InsertSocialMedia,
  LeadCompanyDataModel,
  LeadUserDataModel,
  UserDataModel,
} from "../../schemas";
import {
  AddressTable,
  insertAddressSchema,
  insertLeadUserSchema,
  LeadUserAddressTable,
  LeadUserSocialTable,
  LeadUserTable,
  SocialMediaTable,
} from "../../schemas";
import { SocialMediaPlatfromTypeEnumSchema } from "../../schemas/enums/zod-db-enums";
import { insertChunked, insertChunkedReturning } from "../../utils";

export async function seedEmployees(
  db: DatabaseType,
  companies: Array<LeadCompanyDataModel>,
  users: Array<UserDataModel>
): Promise<Array<LeadUserDataModel>> {
  console.log("🌱 Seeding employees...");

  const employeesData: Array<InsertLeadUser> = companies.flatMap((company) => {
    return zocker(insertLeadUserSchema)
      .generateMany(faker.number.int({ min: 2, max: 50 }))
      .map((employee) => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const createdBy = faker.helpers.arrayElement(users);

        return {
          ...employee,
          leadCompanyId: company.id,
          firstName,
          middleName: faker.helpers.maybe(() => faker.person.middleName(), {
            probability: 0.3,
          }),
          lastName,
          email: faker.internet.email({ firstName, lastName }),
          phone: faker.helpers.maybe(
            () => faker.phone.number({ style: "national" }),
            { probability: 0.6 }
          ),
          jobTitle: faker.person.jobTitle(),
          department: faker.commerce.department(),
          website: faker.helpers.maybe(() => faker.internet.url(), {
            probability: 0.4,
          }),
          createdBy: createdBy.id,
        };
      });
  });

  const employees = await insertChunkedReturning(employeesData, (chunk) =>
    db.insert(LeadUserTable).values(chunk).returning()
  );

  const socialMediaData: Array<InsertSocialMedia> = employees.map(
    (employee) => {
      return {
        platform: faker.helpers.arrayElement(
          SocialMediaPlatfromTypeEnumSchema.options
        ),
        type: "person",
        url: faker.internet.url(),
        username: employee.firstName,
        displayName: employee.firstName,
      } satisfies InsertSocialMedia;
    }
  );

  const socialMedia = await insertChunkedReturning(socialMediaData, (chunk) =>
    db.insert(SocialMediaTable).values(chunk).returning()
  );

  await insertChunked(
    socialMedia.map(({ id }) => {
      const employee = faker.helpers.arrayElement(employees);
      return {
        socialMediaId: id,
        leadUserId: employee.id,
      } satisfies InsertLeadUserSocial;
    }),
    (chunk) => db.insert(LeadUserSocialTable).values(chunk)
  );

  const addressesData = zocker(
    insertAddressSchema.omit({
      latitude: true,
      longitude: true,
      notes: true,
      streetLine2: true,
    })
  )
    .generateMany(employees.length)
    .map((address) => {
      return {
        ...address,
        streetLine1: faker.location.streetAddress(),
        city: faker.location.city(),
        country: faker.location.country(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
      };
    });

  const addresses = await insertChunkedReturning(addressesData, (chunk) =>
    db.insert(AddressTable).values(chunk).returning()
  );

  await insertChunked(
    addresses.map((address) => {
      const employee = faker.helpers.arrayElement(employees);
      return {
        addressId: address.id,
        leadUserId: employee.id,
      } satisfies InsertLeadUserAddress;
    }),
    (chunk) => db.insert(LeadUserAddressTable).values(chunk)
  );

  console.log(`✅ ${employees.length} Employees seeded`);

  return employees;
}
