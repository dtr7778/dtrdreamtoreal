import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import type {
  BaseURLConfig,
  BetterAuthPlugin,
  SecondaryStorage,
} from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { betterAuth } from "better-auth/minimal";
import { admin, haveIBeenPwned, oneTap } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { UAParser } from "ua-parser-js";

import { type DatabaseType } from "@workspace/drizzle/types";
import {
  AccountTable,
  type InsertUserActivity,
  RoleTable,
  SessionTable,
  UserActivityTable,
  UserRoleTable,
  UserTable,
  VerificationTable,
} from "@workspace/drizzle/schemas";
import { RoleEnumSchema } from "@workspace/drizzle/zod-db-enums";

import { IMailTemplates } from "../../mail/src/services/withMailTemplates.mixin";
import { systemAc, systemRoles } from "./access-control";

/** Result every mail hook resolves with. */
export interface AuthMailResult {
  success: boolean;
  error?: string;
}

/**
 * The five notifications the auth package emits. Each mailer variant (BullMQ,
 * QStash) supplies its own implementation; the shared config below only knows
 * this interface.
 */
export type AuthMailHooks = Pick<
  IMailTemplates<AuthMailResult>,
  | "sendWelcomeMail"
  | "sendEmailVerificationMail"
  | "sendPasswordResetMail"
  | "sendPasswordChangedMail"
  | "sendNewDeviceLoginMail"
>;

export interface CreateBetterAuthBaseConfig {
  baseURL?: BaseURLConfig | undefined;
  secret: string;
  appName: string;
  /** Public site URL, used in outbound mail links. */
  siteUrl: string;
  isDev: boolean;
  trustedOrigins: string[];
  errorPagePath: string;
  database: DatabaseType;
  secondaryStorage: SecondaryStorage;
  mailHooks: AuthMailHooks;
  google: {
    clientId: string;
    clientSecret: string;
    redirectURI: string;
  };
  plugins?: BetterAuthPlugin[];
}

function getIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0] ||
    headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

async function createUserActivity(
  database: DatabaseType,
  value: InsertUserActivity
) {
  return await database.insert(UserActivityTable).values(value);
}

/** Throw when a mail hook reports a failure, mirroring better-auth errors. */
function assertMailSent(result: AuthMailResult): void {
  if (!result.success && result.error) {
    throw new APIError("INTERNAL_SERVER_ERROR", { message: result.error });
  }
}

/**
 * Shared better-auth configuration.
 *
 * Mailer-specific factories (`createBetterAuth` for BullMQ,
 * `createQstashBetterAuth` for QStash) build the {@link AuthMailHooks} and hand
 * them in here.
 */
export function createBetterAuthBase(config: CreateBetterAuthBaseConfig) {
  const defaultPlugins: Array<BetterAuthPlugin> = [];

  if (!config.isDev) {
    defaultPlugins.push(
      haveIBeenPwned({
        customPasswordCompromisedMessage:
          "This password is compromised, choose a stronger one",
      })
    );
  }

  return betterAuth({
    baseURL: config.baseURL,
    secret: config.secret,
    appName: config.appName,
    database: drizzleAdapter(config.database, {
      provider: "pg",
      schema: {
        user: UserTable,
        session: SessionTable,
        account: AccountTable,
        verification: VerificationTable,
      },
    }),
    secondaryStorage: config.secondaryStorage,
    rateLimit: {
      storage: "secondary-storage",
    },
    telemetry: { enabled: true },
    trustedOrigins: config.trustedOrigins,
    advanced: {
      database: {
        generateId: false,
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async () => {
            throw new APIError("BAD_REQUEST", {
              message: "Register is currently disabled",
            });
          },
          after: async (user) => {
            // 1. Find the default USER role
            const [defaultRole] = await config.database
              .select()
              .from(RoleTable)
              .where(eq(RoleTable.roleName, "USER"))
              .limit(1);

            if (!defaultRole) return;

            // 2. Assign it in your user_roles join table
            await config.database.insert(UserRoleTable).values({
              userId: user.id,
              roleId: defaultRole.id,
            });
          },
        },
        delete: {
          after: async (user) => {
            await config.database
              .delete(UserRoleTable)
              .where(eq(UserRoleTable.userId, user.id));
          },
        },
      },
      session: {
        delete: {
          before: async (session) => {
            await createUserActivity(config.database, {
              userId: session.userId,
              ipAddress: session.ipAddress,
              userAgent: session.userAgent,
              lastSeenAt: new Date(),
              logoutAt: new Date(),
            });
          },
        },
        create: {
          after: async (session) => {
            await createUserActivity(config.database, {
              userId: session.userId,
              ipAddress: session.ipAddress,
              userAgent: session.userAgent,
              lastSeenAt: new Date(),
              loginAt: new Date(),
            });
          },
        },
      },
    },
    hooks: {
      after: createAuthMiddleware(async (ctx) => {
        // after sign in
        if (ctx.path.startsWith("/sign-in")) {
          const newSession = ctx.context.newSession;
          const headers = ctx.headers ?? ctx.request?.headers;

          if (newSession && headers) {
            const currentUserAgent = headers.get("user-agent");
            const currentIp = getIp(headers);

            if (!currentIp || !currentUserAgent) return;

            if (
              newSession.session.userAgent !== currentUserAgent ||
              newSession.session.ipAddress !== currentIp
            ) {
              ctx.context.runInBackgroundOrAwait(
                (async () => {
                  const { browser, device } = UAParser(currentUserAgent);
                  const result = await config.mailHooks.sendNewDeviceLoginMail({
                    to: newSession.user.email,
                    userName: newSession.user.name,
                    loginTimestamp: Date.now().toString(),
                    deviceInfo: `${device.type} ${device.model}`,
                    browser: `${browser.name} ${browser.version}`,
                    ipAddress: currentIp,
                    approximateLocation: "not available",
                    secureAccountUrl: `${config.siteUrl}/dashboard/settings/reset-password`,
                  });

                  assertMailSent(result);
                })()
              );
            }
          }
        }

        // after password changed
        if (ctx.path.startsWith("/change-password")) {
          const session = ctx.context.session ?? ctx.context.newSession;
          const headers = ctx.headers ?? ctx.request?.headers;

          if (session && headers) {
            const userAgent = headers.get("user-agent");
            const ip = getIp(headers);

            if (!userAgent) return;

            ctx.context.runInBackgroundOrAwait(
              (async () => {
                const { device } = UAParser(userAgent);
                const result = await config.mailHooks.sendPasswordChangedMail({
                  to: session.user.email,
                  userName: session.user.name,
                  changeTimestamp: Date.now().toString(),
                  ipAddress: ip,
                  deviceInfo: `${device.type} ${device.model}`,
                });

                assertMailSent(result);
              })()
            );
          }
        }

        // after user successfully sign up
        if (ctx.path.startsWith("/sign-up")) {
          const user = ctx.context.newSession?.user ?? {
            name: ctx.body.name,
            email: ctx.body.email,
          };
          if (user != null) {
            ctx.context.runInBackgroundOrAwait(
              (async () => {
                const result = await config.mailHooks.sendWelcomeMail({
                  to: user.email,
                  userName: user.name,
                  dashboardUrl: `${config.siteUrl}/dashboard`,
                });

                assertMailSent(result);
              })()
            );
          }
        }
      }),
    },
    onAPIError: {
      errorURL: config.errorPagePath,
    },
    account: {
      accountLinking: {
        trustedProviders: ["google", "email-password"],
      },
    },
    socialProviders: {
      google: {
        clientId: config.google.clientId,
        clientSecret: config.google.clientSecret,
        redirectURI: config.google.redirectURI,
        accessType: "offline",
        prompt: "select_account",
        disableSignUp: true,
      },
    },
    user: {
      additionalFields: {
        timezone: {
          type: "string",
          input: true,
          required: false,
        },
        locale: {
          type: "string",
          input: true,
          required: false,
        },
        currency: {
          type: "string",
          input: true,
          required: false,
        },
      },
      changeEmail: {
        enabled: false,
      },
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // Cache duration in seconds
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      expiresIn: 60 * 60,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        const result = await config.mailHooks.sendEmailVerificationMail({
          to: user.email,
          userName: user.name,
          verifyUrl: url,
        });

        assertMailSent(result);
      },
    },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
      maxPasswordLength: 20,
      autoSignIn: false,
      requireEmailVerification: true,
      resetPasswordTokenExpiresIn: 60 * 60,
      disableSignUp: true,
      sendResetPassword: async ({ user, url }) => {
        const result = await config.mailHooks.sendPasswordResetMail({
          to: user.email,
          userName: user.name,
          resetUrl: url,
        });

        assertMailSent(result);
      },
    },
    plugins: [
      admin({
        ac: systemAc,
        roles: systemRoles,
        defaultRole: RoleEnumSchema.enum.USER,
        adminRoles: [
          RoleEnumSchema.enum.ADMIN,
          RoleEnumSchema.enum.SUPER_ADMIN,
        ],
        defaultBanExpiresIn: 60 * 60 * 24 * 10, // 10 day
        bannedUserMessage: "Your account is currently banned",
      }),
      ...defaultPlugins,
      oneTap(),
      ...(config.plugins ?? []),
    ],
  });
}

export type AuthType = ReturnType<typeof createBetterAuthBase>;
