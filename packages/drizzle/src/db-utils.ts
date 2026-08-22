import { timestamp, uuid } from "drizzle-orm/pg-core";

export const db_id = uuid("id").primaryKey().defaultRandom().notNull();

export const db_created_at = timestamp("created_at", {
  withTimezone: true,
  precision: 3,
})
  .notNull()
  .defaultNow();

export const db_updated_at = timestamp("updated_at", {
  withTimezone: true,
  precision: 3,
})
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date());

export const db_soft_delete = {
  deletedAt: timestamp("deleted_at", { withTimezone: true, precision: 3 }),
  deletedBy: uuid("deleted_by"), // References the user who deleted it
};
