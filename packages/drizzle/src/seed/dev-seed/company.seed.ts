import { faker } from "@faker-js/faker";
import { zocker } from "zocker";

import type { DatabaseType } from "../../clients/drizzle-client";
import type {
  LeadCompanyDataModel,
  InsertLeadCompanyAddress,
  InsertLeadCompanySocial,
  InsertSocialMedia,
  UserDataModel} from "../../schemas";
import {
  AddressTable,
  LeadCompanyAddressTable,
  LeadCompanySocialTable,
  LeadCompanyTable,
  insertAddressSchema,
  insertLeadCompanySchema,
  SocialMediaTable
} from "../../schemas";
import { SocialMediaPlatfromTypeEnumSchema } from "../../schemas/enums/zod-db-enums";
import { seedConfigs } from "../seed.config";
import { insertChunked, insertChunkedReturning } from "../seed-utils";

export async function seedCompanies(
  db: DatabaseType,
  users: Array<UserDataModel>
): Promise<Array<LeadCompanyDataModel>> {
  console.log("🌱 Seeding companies...");

  const companiesData = zocker(insertLeadCompanySchema.omit({ context: true }))
    .generateMany(seedConfigs.targets.companies)
    .map((company) => {
      const createdBy = faker.helpers.arrayElement(users);
      const industry = faker.commerce.department();

      return {
        ...company,
        context: {
          whatWeDo: industry,
        },
        industry: industry,
        description: faker.helpers.maybe(
          () => faker.lorem.sentences({ min: 1, max: 3 }),
          { probability: 0.5 }
        ),
        name: faker.company.name(),
        legalName: faker.helpers.maybe(() => faker.company.name(), {
          probability: 0.8,
        }),
        phone: faker.helpers.maybe(
          () => faker.phone.number({ style: "national" }),
          { probability: 0.7 }
        ),
        createdBy: createdBy.id,
        employSize: faker.helpers.arrayElement([
          "1-10",
          "11-50",
          "51-200",
          "201-500",
          "501-1000",
          "1000+",
        ]),
      };
    });

  const companies = await insertChunkedReturning(companiesData, (chunk) =>
    db.insert(LeadCompanyTable).values(chunk).returning()
  );

  const socialMediaData: Array<InsertSocialMedia> = companies.map((company) => {
    return {
      platform: faker.helpers.arrayElement(
        SocialMediaPlatfromTypeEnumSchema.options
      ),
      type: "company",
      url: faker.internet.url(),
      username: company.name.toLowerCase(),
      displayName: company.name,
    } satisfies InsertSocialMedia;
  });

  const socialMedia = await insertChunkedReturning(
    socialMediaData,
    (chunk) => db.insert(SocialMediaTable).values(chunk).returning()
  );

  await insertChunked(
    socialMedia.map(({ id }) => {
      const company = faker.helpers.arrayElement(companies);
      return {
        socialMediaId: id,
        leadCompanyId: company.id,
      } satisfies InsertLeadCompanySocial;
    }),
    (chunk) => db.insert(LeadCompanySocialTable).values(chunk)
  );

  const addressesData = zocker(
    insertAddressSchema.omit({
      latitude: true,
      longitude: true,
      notes: true,
      streetLine2: true,
    })
  )
    .generateMany(companies.length)
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
      const company = faker.helpers.arrayElement(companies);
      return {
        addressId: address.id,
        leadCompanyId: company.id,
      } satisfies InsertLeadCompanyAddress;
    }),
    (chunk) => db.insert(LeadCompanyAddressTable).values(chunk)
  );

  console.log(`✅ ${companies.length} Companies seeded`);

  return companies;
}