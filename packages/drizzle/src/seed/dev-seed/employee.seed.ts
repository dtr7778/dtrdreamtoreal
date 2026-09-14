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
} from "../../schemas";
import { SocialMediaPlatfromTypeEnumSchema } from "../../schemas/enums/zod-db-enums";
import { db } from "../seed-db-client";

const DEPARTMENT_OPTIONS = [
  "Engineering",
  "Marketing",
  "Sales",
  "Human Resources",
  "Finance",
  "Operations",
  "Product",
  "Design",
  "Customer Support",
  "Legal",
];

const JOB_TITLES: Record<string, string[]> = {
  Engineering: [
    "Software Engineer",
    "Senior Software Engineer",
    "Tech Lead",
    "Engineering Manager",
    "DevOps Engineer",
  ],
  Marketing: [
    "Marketing Manager",
    "Content Strategist",
    "SEO Specialist",
    "Brand Manager",
    "Growth Hacker",
  ],
  Sales: [
    "Sales Representative",
    "Account Executive",
    "Sales Manager",
    "Business Development Rep",
    "Sales Director",
  ],
  "Human Resources": [
    "HR Manager",
    "Recruiter",
    "HR Business Partner",
    "Talent Acquisition Specialist",
  ],
  Finance: [
    "Financial Analyst",
    "Accountant",
    "CFO",
    "Controller",
    "Financial Manager",
  ],
  Operations: [
    "Operations Manager",
    "Project Manager",
    "Business Analyst",
    "Process Improvement Specialist",
  ],
  Product: [
    "Product Manager",
    "Product Owner",
    "Scrum Master",
    "Business Analyst",
  ],
  Design: [
    "UI Designer",
    "UX Designer",
    "Graphic Designer",
    "Creative Director",
    "Design Lead",
  ],
  "Customer Support": [
    "Support Specialist",
    "Support Manager",
    "Customer Success Manager",
    "Technical Support Engineer",
  ],
  Legal: [
    "Legal Counsel",
    "Paralegal",
    "Compliance Officer",
    "Contract Manager",
  ],
};

export async function seedEmployees(
  companies: Array<CompanyDataModel>
): Promise<Array<EmployeeDataModel>> {
  console.log("🌱 Seeding employees...");

  const employeesData: Array<InsertEmployee> = companies.flatMap((company) => {
    const employeeCount = faker.number.int({ min: 1, max: 4 });

    return zocker(insertEmployeeSchema)
      .generateMany(employeeCount)
      .map((employee) => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const department = faker.helpers.arrayElement(DEPARTMENT_OPTIONS);
        const jobTitle = faker.helpers.arrayElement(
          JOB_TITLES[department] ?? ["Employee"]
        );

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
          jobTitle,
          department,
          website: faker.helpers.maybe(() => faker.internet.url(), {
            probability: 0.4,
          }),
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
