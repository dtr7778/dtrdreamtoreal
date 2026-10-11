import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DatabaseType } from "@workspace/drizzle/client";

import { createMailService } from "./createMailService.factory";

vi.mock("../services/Email.service", () => ({
  EmailService: class {
    public createOutboundEmailRecord = vi.fn();
    public updateEmailById = vi.fn();
  },
}));

const mailConfig = {
  appName: "DTR",
  systemMail: "notification@mail.dtrdreamtoreal.com",
  supportMail: "support@mail.dtrdreamtoreal.com",
};

describe("createMailService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a template-enabled queue mail service", () => {
    const service = createMailService({
      database: {} as DatabaseType,
      queue: { send: vi.fn() },
      mailConfig,
    });

    expect(typeof service.sendMail).toBe("function");
    expect(typeof service.sendWelcomeMail).toBe("function");
  });
});
