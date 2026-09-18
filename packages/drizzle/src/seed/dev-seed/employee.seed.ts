import { faker } from "@faker-js/faker";
import { zocker } from "zocker";

import {
  AddressTable,
  CompanyDataModel,
  EmployeeAddressTable,
  EmployeeDataModel,
  EmployeeSocialTable,
  EmployeeTable,
  insertAddressSchema,
  InsertEmployee,
  InsertEmployeeAddress,
  insertEmployeeSchema,
  InsertEmployeeSocial,
  InsertSocialMedia,
  SocialMediaTable,
  UserDataModel,
} from "../../schemas";
import { SocialMediaPlatfromTypeEnumSchema } from "../../schemas/enums/zod-db-enums";
import { db } from "../seed-db-client";

export async function seedEmployees(
  companies: Array<CompanyDataModel>,
  users: Array<UserDataModel>
): Promise<Array<EmployeeDataModel>> {
  console.log("🌱 Seeding employees...");

  const employeesData: Array<InsertEmployee> = companies.flatMap((company) => {
    return zocker(insertEmployeeSchema)
      .generateMany(faker.number.int({ min: 2, max: 50 }))
      .map((employee) => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const createdBy = faker.helpers.arrayElement(users);

        return {
          ...employee,
          companyId: company.id,
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

  const employees = await db
    .insert(EmployeeTable)
    .values(employeesData)
    .returning();

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

  const socialMedia = await db
    .insert(SocialMediaTable)
    .values(socialMediaData)
    .returning();

  await db.insert(EmployeeSocialTable).values(
    socialMedia.map(({ id }) => {
      const employee = faker.helpers.arrayElement(employees);
      return {
        socialMediaId: id,
        employeeId: employee.id,
      } satisfies InsertEmployeeSocial;
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

  const addresses = await db
    .insert(AddressTable)
    .values(addressesData)
    .returning();

  await db.insert(EmployeeAddressTable).values(
    addresses.map((address) => {
      const employee = faker.helpers.arrayElement(employees);
      return {
        addressId: address.id,
        employeeId: employee.id,
      } satisfies InsertEmployeeAddress;
    })
  );

  console.log(`✅ ${employees.length} Employees seeded`);

  return employees;
}
