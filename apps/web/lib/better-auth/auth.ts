import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import type { BetterAuthPlugin } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { admin, haveIBeenPwned, oneTap } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { UAParser } from "ua-parser-js";

import {
  AccountTable,
  RoleTable,
  SessionTable,
  UserRoleTable,
  UserTable,
  VerificationTable,
} from "@workspace/drizzle/schemas";
import { RoleEnumSchema } from "@workspace/drizzle/zod-db-enums";

import { ERROR_PAGE_PATH } from "@/constants";
import { createUserActivity } from "@/features/user/data/create-user-activity";
import { getIp } from "@/utils/getIp";

import { db } from "../db";
import { env } from "../env";
import { qstashMail } from "../mail/qstash-mail";
import { systemAc, systemRoles } from "./accessControl.system";
import { redisSecondaryStorage } from "./secondaryStorage";

function createBetterAuth() {
  const defaultPlugins: Array<BetterAuthPlugin> = [];

  if (env.NODE_ENV === "production") {
    defaultPlugins.push(
      haveIBeenPwned({
        customPasswordCompromisedMessage:
          "This password is compromised, choose a stronger one",
      })
    );
  }

  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    appName: env.NEXT_PUBLIC_SITE_NAME,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: UserTable,
        session: SessionTable,
        account: AccountTable,
        verification: VerificationTable,
      },
    }),
    secondaryStorage: redisSecondaryStorage,
    rateLimit: {
      storage: "secondary-storage",
    },
    telemetry: { enabled: true },
    trustedOrigins: [env.NEXT_PUBLIC_SITE_URL],
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
            const [defaultRole] = await db
              .select()
              .from(RoleTable)
              .where(eq(RoleTable.roleName, "USER"))
              .limit(1);

            if (!defaultRole) return;

            // 2. Assign it in your user_roles join table
            await db.insert(UserRoleTable).values({
              userId: user.id,
              roleId: defaultRole.id,
            });
          },
        },
        delete: {
          after: async (user) => {
            await db
              .delete(UserRoleTable)
              .where(eq(UserRoleTable.userId, user.id));
          },
        },
      },
      session: {
        delete: {
          before: async (session) => {
            await createUserActivity({
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
            await createUserActivity({
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
                  const { success, error } =
                    await qstashMail.sendNewDeviceLoginMail({
                      to: newSession.user.email,
                      userName: newSession.user.name,
                      loginTimestamp: Date.now().toString(),
                      deviceInfo: `${device.type} ${device.model}`,
                      browser: `${browser.name} ${browser.version}`,
                      ipAddress: currentIp,
                      approximateLocation: "not available",
                      secureAccountUrl: `${env.NEXT_PUBLIC_SITE_URL}/dashboard/settings/reset-password`,
                    });

                  if (!success && error) {
                    throw new APIError("INTERNAL_SERVER_ERROR", {
                      message: error,
                    });
                  }
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
                const { success, error } =
                  await qstashMail.sendPasswordChangedMail({
                    to: session.user.email,
                    userName: session.user.name,
                    changeTimestamp: Date.now().toString(),
                    ipAddress: ip,
                    deviceInfo: `${device.type} ${device.model}`,
                  });

                if (!success && error) {
                  throw new APIError("INTERNAL_SERVER_ERROR", {
                    message: error,
                  });
                }
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
                const { success, error } = await qstashMail.sendWelcomeUserMail(
                  {
                    to: user.email,
                    userName: user.name,
                    dashboardUrl: `${env.NEXT_PUBLIC_SITE_URL}/dashboard`,
                  }
                );

                if (!success && error) {
                  throw new APIError("INTERNAL_SERVER_ERROR", {
                    message: error,
                  });
                }
              })()
            );
          }
        }
      }),
    },
    onAPIError: {
      errorURL: ERROR_PAGE_PATH,
    },
    account: {
      accountLinking: {
        trustedProviders: ["google", "email-password"],
      },
    },
    socialProviders: {
      google: {
        clientId: env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID,
        clientSecret: env.GOOGLE_AUTH_CLIENT_SECRET,
        redirectURI: `${env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/google`,
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
        const { success, error } = await qstashMail.sendEmailVerificationMail({
          to: user.email,
          verifyUrl: url,
          userName: user.name,
        });

        if (!success && error) {
          throw error;
        }
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
        const { success, error } = await qstashMail.sendPasswordResetMail({
          to: user.email,
          resetUrl: url,
          userName: user.name,
        });

        if (!success && error) {
          throw error;
        }
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
      nextCookies(),
    ],
  });
}

export const auth = createBetterAuth();
