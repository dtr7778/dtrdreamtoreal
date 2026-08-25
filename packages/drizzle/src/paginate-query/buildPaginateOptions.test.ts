import { boolean, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { describe, expect, test } from "vitest";

import { db_created_at, db_id, db_updated_at } from "../db-utils";
import { buildPaginateOptions } from "./buildPaginateOptions";

describe("buildPaginateOptions", () => {
  const UserTable = pgTable("users", {
    id: db_id,
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: varchar("image", { length: 255 }),
    role: varchar("role", { length: 255 }),
    banned: boolean("banned").default(false),
    banReason: varchar("ban_reason", { length: 255 }),
    banExpires: timestamp("ban_expires", {
      withTimezone: true,
      precision: 3,
    }),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  });

  test("should build paginate options", () => {
    const paginateOptions = buildPaginateOptions(
      {
        id: UserTable.id,
        name: UserTable.name,
        email: UserTable.email,
        emailVerified: UserTable.emailVerified,
        image: UserTable.image,
        role: UserTable.role,
        banned: UserTable.banned,
        banReason: UserTable.banReason,
        banExpires: UserTable.banExpires,
        createdAt: UserTable.createdAt,
        updatedAt: UserTable.updatedAt,
      },
      {
        search: "test",
        searchFields: ["name", "email"],
        filter: {},
        orderField: "createdAt",
        order: "asc",
        page: 1,
        limit: 10,
      }
    );

    expect(paginateOptions).include({
      limit: 10,
      offset: 0,
      page: 1,
    });
  });
});
