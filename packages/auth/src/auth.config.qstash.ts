import {
  type AuthMailHooks,
  createBetterAuthBase,
  type CreateBetterAuthBaseConfig,
} from "./auth.config.base";

export type CreateQstashBetterAuthConfig = Omit<
  CreateBetterAuthBaseConfig,
  "mailHooks"
> & {
  mailer: AuthMailHooks;
};

/**
 * better-auth wired for the QStash mailer.
 *
 * The caller supplies any object matching {@link QstashAuthMailer} (e.g.
 * `createQstashMailer(...)`); each hook delegates to a named method.
 */
export function createQstashBetterAuth(config: CreateQstashBetterAuthConfig) {
  const { mailer, ...base } = config;

  const mailHooks: AuthMailHooks = {
    sendWelcomeMail: (input) => mailer.sendWelcomeMail(input),
    sendEmailVerificationMail: (input) =>
      mailer.sendEmailVerificationMail(input),
    sendPasswordResetMail: (input) => mailer.sendPasswordResetMail(input),
    sendPasswordChangedMail: (input) => mailer.sendPasswordChangedMail(input),
    sendNewDeviceLoginMail: (input) => mailer.sendNewDeviceLoginMail(input),
  };

  return createBetterAuthBase({
    ...base,
    mailHooks,
  });
}
