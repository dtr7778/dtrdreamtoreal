import { faker } from "@faker-js/faker";
import { hashPassword } from "better-auth/crypto";

import {
  AccountDataModel,
  AccountTable,
  InsertAccount,
  UserDataModel,
} from "../../schemas";
import { db } from "../seed-db-client";

const DEFAULT_PASSWORD = "12345678";

export async function seedAccounts(
  users: Array<UserDataModel>
): Promise<Array<AccountDataModel>> {
  console.log("🌱 Seeding accounts...");

  const hashedPassword = await hashPassword(DEFAULT_PASSWORD);

  const accountsData: Array<InsertAccount> = users.map(
    (u) =>
      ({
        accountId: faker.string.uuid(),
        providerId: "credential",
        password: hashedPassword,
        userId: u.id,
      }) as InsertAccount
  );

  const accounts = await db
    .insert(AccountTable)
    .values(accountsData)
    .returning();

  console.log(`✅ ${accountsData.length} Accounts seeded`);
  return accounts;
}
