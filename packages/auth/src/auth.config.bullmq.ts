import type { MailTemplateName, TemplateMailPayload } from "@workspace/mail";

import {
  type AuthMailHooks,
  createBetterAuthBase,
  type CreateBetterAuthBaseConfig,
} from "./auth.config.base";

/** The BullMQ mailer surface the auth hooks rely on. */
type AuthMailer = {
  send<K extends MailTemplateName>(
    payload: TemplateMailPayload<K>
  ): Promise<{ success: boolean; error?: string }>;
};

type CreateBetterAuthConfig = Omit<CreateBetterAuthBaseConfig, "mailHooks"> & {
  mailer: AuthMailer;
};

/**
 * better-auth wired for the BullMQ mail publisher.
 *
 * The caller supplies any object matching {@link AuthMailer}; the publisher
 * renders the registered template and ships it to the backend.
 */
export function createBullmqBetterAuth(config: CreateBetterAuthConfig) {
  const { mailer, ...base } = config;

  const mailHooks: AuthMailHooks = {
    sendWelcomeMail: (input) =>
      mailer.send({
        template: "welcome",
        data: { userName: input.userName, dashboardUrl: input.dashboardUrl },
        to: input.to,
      }),
    sendEmailVerificationMail: (input) =>
      mailer.send({
        template: "emailVerification",
        data: { userName: input.userName, verifyUrl: input.verifyUrl },
        to: input.to,
      }),
    sendPasswordResetMail: (input) =>
      mailer.send({
        template: "passwordReset",
        data: { userName: input.userName, resetUrl: input.resetUrl },
        to: input.to,
      }),
    sendPasswordChangedMail: (input) =>
      mailer.send({
        template: "passwordChanged",
        data: {
          userName: input.userName,
          changeTimestamp: input.changeTimestamp,
          ipAddress: input.ipAddress,
          deviceInfo: input.deviceInfo,
        },
        to: input.to,
      }),
    sendNewDeviceLoginMail: (input) =>
      mailer.send({
        template: "newDeviceLogin",
        data: {
          userName: input.userName,
          loginTimestamp: input.loginTimestamp,
          deviceInfo: input.deviceInfo,
          browser: input.browser,
          ipAddress: input.ipAddress,
          approximateLocation: input.approximateLocation,
          secureAccountUrl: input.secureAccountUrl,
        },
        to: input.to,
      }),
  };

  return createBetterAuthBase({
    ...base,
    mailHooks,
  });
}
