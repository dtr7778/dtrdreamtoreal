import type { DatabaseType } from "@workspace/drizzle/client";
import {
  type InsertUserActivity,
  UserActivityTable,
} from "@workspace/drizzle/schemas";

import { db } from "@/lib/db";

export async function createUserActivity(
  value: InsertUserActivity,
  database: DatabaseType = db
) {
  return await database.insert(UserActivityTable).values(value);
}
