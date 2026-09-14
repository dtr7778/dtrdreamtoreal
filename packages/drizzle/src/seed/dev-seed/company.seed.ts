import { faker } from "@faker-js/faker";
import { zocker } from "zocker";

import {
  AddressTable,
  CompanyAddressTable,
  CompanyDataModel,
  CompanySocialTable,
  CompanyTable,
  insertAddressSchema,
  InsertCompanyAddress,
  insertCompanySchema,
  InsertCompanySocial,
  InsertSocialMedia,
  SocialMediaTable,
} from "../../schemas";
import { SocialMediaPlatfromTypeEnumSchema } from "../../schemas/enums/zod-db-enums";
import { db } from "../seed-db-client";
import { seedConfigs } from "../seed.config";

export async function seedCompanies(): Promise<Array<CompanyDataModel>> {
  console.log("🌱 Seeding companies...");

  const companiesData = zocker(insertCompanySchema)
    .generateMany(seedConfigs.targets.companies)
    .map((company) => {
      return {
        ...company,
        name: faker.company.name(),
        legalName: faker.company.name(),
        phone: faker.phone.number({ style: "national" }),
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

  const companies = await db
    .insert(CompanyTable)
    .values(companiesData)
    .returning();

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

  const socialMedia = await db
    .insert(SocialMediaTable)
    .values(socialMediaData)
    .returning();

  await db.insert(CompanySocialTable).values(
    socialMedia.map(({ id }) => {
      const company = faker.helpers.arrayElement(companies);
      return {
        socialMediaId: id,
        companyId: company.id,
      } satisfies InsertCompanySocial;
    })
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

  const addresses = await db
    .insert(AddressTable)
    .values(addressesData)
    .returning();

  await db.insert(CompanyAddressTable).values(
    addresses.map((address) => {
      const company = faker.helpers.arrayElement(companies);
      return {
        addressId: address.id,
        companyId: company.id,
      } satisfies InsertCompanyAddress;
    })
  );

  console.log(`✅ ${companies.length} Companies seeded`);

  return companies;
}
