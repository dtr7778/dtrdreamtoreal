import { describe, expect, it } from "vitest";

import {
  companyTaskCreateSchema,
  companyTaskUpdateSchema,
} from "./task.schema";

describe("company task assignee schema", () => {
  it("defaults a new task to no assignees", () => {
    const parsed = companyTaskCreateSchema.parse({
      title: "Ship it",
      description: "",
      priority: "medium",
      dueDate: null,
    });

    expect(parsed.assigneeIds).toEqual([]);
  });

  it("omits assigneeIds on an update so a status drag cannot clear them", () => {
    const parsed = companyTaskUpdateSchema.parse({ status: "done" });

    expect(Object.prototype.hasOwnProperty.call(parsed, "assigneeIds")).toBe(
      false
    );
  });

  it("passes an explicit empty list through on update (clear all)", () => {
    const parsed = companyTaskUpdateSchema.parse({ assigneeIds: [] });

    expect(parsed.assigneeIds).toEqual([]);
  });
});
