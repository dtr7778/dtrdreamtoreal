import { randomUUID } from "node:crypto";
import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { createClient } from "@libsql/client";
import type { Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { DatabaseType } from "@workspace/drizzle/client";
import * as schema from "@workspace/drizzle/schemas";

import { buildCompanyTaskListQuery } from "./companyTask.query";

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

const migrationsFolder = findMigrationsFolder();
const databaseFile = path.join(tmpdir(), `dtr-company-task-${randomUUID()}.db`);

let client: Client;
let db: DatabaseType;

beforeAll(async () => {
  client = createClient({ url: `file:${databaseFile}` });
  const libsqlDb = drizzle(client, { schema });

  await migrate(libsqlDb, { migrationsFolder });

  db = libsqlDb as unknown as DatabaseType;

  // u1 has two roles, u2 has one role, u3 has none.
  // t1 is assigned to u1 and u2. t3 is created by a user without roles;
  // t4 has no creator and no assignees.
  await client.batch(
    [
      `insert into users (id, name, email, role) values
        ('u1', 'Ann', 'ann@example.com', 'user'),
        ('u2', 'Bob', 'bob@example.com', 'user'),
        ('u3', 'Cara', 'cara@example.com', 'user')`,
      `insert into roles (id, role_name) values
        ('r1', 'ADMIN'),
        ('r2', 'EDITOR')`,
      `insert into user_roles (id, user_id, role_id) values
        ('ur1', 'u1', 'r1'),
        ('ur2', 'u1', 'r2'),
        ('ur3', 'u2', 'r1')`,
      `insert into company_tasks
        (id, title, created_by, assigned_by_id, updated_by, updated_at)
        values
        ('t4', 'Delta', null, null, null, 4000),
        ('t1', 'Alpha', 'u1', 'u1', 'u3', 3000),
        ('t2', 'Beta', 'u2', null, null, 2000),
        ('t3', 'Gamma', 'u3', null, null, 1000)`,
      `insert into company_task_assignees (id, task_id, user_id) values
        ('cta1', 't1', 'u1'),
        ('cta2', 't1', 'u2')`,
    ],
    "write"
  );
});

afterAll(() => {
  client.close();
  rmSync(databaseFile, { force: true });
});

function listTasks() {
  return buildCompanyTaskListQuery(db);
}

describe("buildCompanyTaskListQuery", () => {
  it("returns every company task", async () => {
    const tasks = await listTasks();

    expect(tasks.map((task) => task.id).sort()).toEqual([
      "t1",
      "t2",
      "t3",
      "t4",
    ]);
  });

  it("returns every assigned user on a task", async () => {
    const tasks = await listTasks();
    const task = tasks.find((item) => item.id === "t1");

    expect(task?.assignees.map((assignee) => assignee.id).sort()).toEqual([
      "u1",
      "u2",
    ]);
  });

  it("returns each assignee's own roles once, without contamination", async () => {
    const tasks = await listTasks();
    const task = tasks.find((item) => item.id === "t1");
    const u1 = task?.assignees.find((assignee) => assignee.id === "u1");
    const u2 = task?.assignees.find((assignee) => assignee.id === "u2");

    expect(u1?.roles.map((role) => role.id).sort()).toEqual(["r1", "r2"]);
    expect(u2?.roles.map((role) => role.id)).toEqual(["r1"]);
  });

  it("returns an empty assignee list when a task has none", async () => {
    const tasks = await listTasks();

    expect(tasks.find((item) => item.id === "t2")?.assignees).toEqual([]);
  });

  it("includes tasks whose creator has no roles", async () => {
    const tasks = await listTasks();

    expect(tasks.map((task) => task.id)).toContain("t3");
  });

  it("includes tasks with no creator and reports the creator as null", async () => {
    const tasks = await listTasks();
    const task = tasks.find((item) => item.id === "t4");

    expect(task).toBeDefined();
    expect(task?.createdByUser).toBeNull();
  });

  it("returns each user's roles once, regardless of the other joined users", async () => {
    const tasks = await listTasks();
    const task = tasks.find((item) => item.id === "t1");

    expect(task?.createdByUser?.roles.map((role) => role.id).sort()).toEqual([
      "r1",
      "r2",
    ]);
  });
});
