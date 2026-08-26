import { faker } from "@faker-js/faker";
import { zocker } from "zocker";

import {
  selectSessionSchema,
  selectUserSchema,
  SessionDataModel,
  UserDataModel,
} from "@workspace/drizzle/schemas";

export function mockAuthSession(
  overrides: Partial<SessionDataModel> = {}
): SessionDataModel {
  const session = zocker(selectSessionSchema).generate();

  return {
    ...session,
    ...overrides,
  };
}

export function mockAuthUser(
  overrides: Partial<UserDataModel> = {}
): UserDataModel {
  const isBanned = faker.datatype.boolean(0.05);

  const user = zocker(selectUserSchema)
    .supply(selectUserSchema.shape.name, faker.person.fullName())
    .supply(
      selectUserSchema.shape.image,
      faker.image.personPortrait({ size: 128 })
    )
    .supply(selectUserSchema.shape.banned, isBanned)
    .supply(
      selectUserSchema.shape.banExpires,
      isBanned ? faker.date.future() : null
    )
    .supply(
      selectUserSchema.shape.banReason,
      isBanned ? faker.lorem.sentence() : null
    )
    .supply(selectUserSchema.shape.timezone, faker.location.timeZone())
    .supply(
      selectUserSchema.shape.locale,
      faker.location.countryCode("alpha-2")
    )
    .supply(selectUserSchema.shape.currency, faker.finance.currency().code)
    .generate();

  return {
    ...user,
    ...overrides,
  };
}

export function mockSessionWithUser(overrides?: {
  session?: Partial<SessionDataModel>;
  user?: Partial<UserDataModel>;
}) {
  return {
    session: mockAuthSession(overrides?.session),
    user: mockAuthUser(overrides?.user),
  };
}
