import { randomUUID } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { createClient } from "@libsql/client";
import type { Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import * as schema from "@workspace/drizzle/schemas";

/** Walks up from the working directory to find the repo's migration folder. */
function findMigrationsFolder() {
  let dir = process.cwd();

  while (true) {
    const candidate = path.join(dir, "migrations");

    if (existsSync(path.join(candidate, "meta", "_journal.json"))) {
      return candidate;
    }

    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error("Could not find the migrations folder");
    }
    dir = parent;
  }
}

const realMigrations = findMigrationsFolder();
const workDir = path.join(tmpdir(), `dtr-task-migration-${randomUUID()}`);
const stagedMigrations = path.join(workDir, "migrations");
const databaseFile = path.join(workDir, "test.db");

let client: Client;

interface JournalEntry {
  tag: string;
}

interface Journal {
  version: string;
  dialect: string;
  entries: Array<JournalEntry>;
}

/**
 * Builds a temporary migrations folder. With `includeLatest` false it holds
 * everything up to the final migration (the pre-change state); with true it also
 * includes the final migration. This lets us apply the final migration the way
 * the app does (through the migrator, which wraps each file in a transaction).
 */
function prepareStagedMigrations(includeLatest: boolean) {
  rmSync(stagedMigrations, { recursive: true, force: true });
  mkdirSync(path.join(stagedMigrations, "meta"), { recursive: true });

  const sqlFiles = readdirSync(realMigrations)
    .filter((file) => file.endsWith(".sql"))
    .sort();
  const latest = sqlFiles.at(-1);
  if (!latest) {
    throw new Error("No migrations found");
  }
  const latestTag = latest.replace(/\.sql$/, "");

  for (const file of sqlFiles) {
    if (!includeLatest && file === latest) {
      continue;
    }
    copyFileSync(
      path.join(realMigrations, file),
      path.join(stagedMigrations, file)
    );
  }

  const journal = JSON.parse(
    readFileSync(path.join(realMigrations, "meta", "_journal.json"), "utf8")
  ) as Journal;
  const entries = includeLatest
    ? journal.entries
    : journal.entries.filter((entry) => entry.tag !== latestTag);

  writeFileSync(
    path.join(stagedMigrations, "meta", "_journal.json"),
    JSON.stringify({ ...journal, entries }, null, 2)
  );
}

beforeAll(async () => {
  mkdirSync(workDir, { recursive: true });
  client = createClient({ url: `file:${databaseFile}` });
  const db = drizzle(client, { schema });

  // 1. Migrate to the pre-change state.
  prepareStagedMigrations(false);
  await migrate(db, { migrationsFolder: stagedMigrations });

  // 2. A legacy single-assignee company task.
  await client.batch(
    [
      `insert into users (id, name, email, role) values ('u1', 'Ann', 'ann@example.com', 'user')`,
      `insert into company_tasks (id, title, assignee_id) values ('t1', 'Alpha', 'u1')`,
    ],
    "write"
  );

  // 3. Apply the final migration through the migrator (transaction-wrapped).
  prepareStagedMigrations(true);
  await migrate(db, { migrationsFolder: stagedMigrations });
});

afterAll(() => {
  client.close();
  rmSync(workDir, { recursive: true, force: true });
});

async function columnsOf(table: string) {
  const result = await client.execute(`PRAGMA table_info(${table})`);
  return result.rows.map((row) => row.name as string);
}

describe("company task assignee migration", () => {
  it("preserves the legacy assignee as a junction row", async () => {
    const result = await client.execute(
      `select task_id, user_id from company_task_assignees`
    );

    expect(result.rows).toEqual([{ task_id: "t1", user_id: "u1" }]);
  });

  it("drops the legacy assignee_id column", async () => {
    expect(await columnsOf("company_tasks")).not.toContain("assignee_id");
  });

  it("cascades junction rows on both task and user deletes", async () => {
    const result = await client.execute(
      `PRAGMA foreign_key_list(company_task_assignees)`
    );
    const cascades = result.rows
      .filter((row) => row.on_delete === "CASCADE")
      .map((row) => row.table)
      .sort();

    expect(cascades).toEqual(["company_tasks", "users"]);
  });
});
