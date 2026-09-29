import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import type {
  BaseURLConfig,
  BetterAuthPlugin,
  SecondaryStorage,
} from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { betterAuth } from "better-auth/minimal";
import { admin, haveIBeenPwned, oneTap } from "better-auth/plugins";
import { and, eq } from "drizzle-orm";

import {
  AccountTable,
  type InsertUserDevice,
  type InsertUserEvent,
  RoleTable,
  SessionTable,
  UserDeviceTable,
  UserEventTable,
  UserRoleTable,
  UserSessionTable,
  UserTable,
  VerificationTable,
} from "@workspace/drizzle/schemas";
import { type DatabaseType } from "@workspace/drizzle/types";
import { RoleEnumSchema } from "@workspace/drizzle/zod-db-enums";

import { IMailTemplates } from "../../mail/src/services/withMailTemplates.mixin";
import { systemAc, systemRoles } from "./access-control";
import { parseUserAgent } from "./device-fingerprint";

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
  domainName?: string;
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

function resolveCookieDomain(domainName: string): string {
  return `.${domainName.trim().replace(/^\.+/, "")}`;
}

function getIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0] ||
    headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

async function createUserEvent(database: DatabaseType, value: InsertUserEvent) {
  return await database.insert(UserEventTable).values(value);
}

async function upsertUserDevice(
  database: DatabaseType,
  value: InsertUserDevice
) {
  const [device] = await database
    .insert(UserDeviceTable)
    .values(value)
    .onConflictDoUpdate({
      target: [UserDeviceTable.userId, UserDeviceTable.fingerprint],
      set: {
        browser: value.browser,
        os: value.os,
        deviceType: value.deviceType,
        lastSeenAt: new Date(),
      },
    })
    .returning();

  return device;
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
      crossSubDomainCookies:
        config.domainName && !config.isDev
          ? { enabled: true, domain: resolveCookieDomain(config.domainName) }
          : undefined,
    },
    databaseHooks: {
      user: {
        create: {
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
            try {
              const [closed] = await config.database
                .update(UserSessionTable)
                .set({ logoutAt: new Date(), lastSeenAt: new Date() })
                .where(eq(UserSessionTable.sessionId, session.id))
                .returning({ deviceId: UserSessionTable.deviceId });

              await createUserEvent(config.database, {
                userId: session.userId,
                event: "auth.logout",
                sessionId: session.id,
                deviceId: closed?.deviceId ?? null,
                ipAddress: session.ipAddress,
                userAgent: session.userAgent,
              });
            } catch (error) {
              console.error("Failed to record logout activity", error);
            }
          },
        },
      },
    },
    hooks: {
      after: createAuthMiddleware(async (ctx) => {
        const headers = ctx.headers ?? ctx.request?.headers;
        const newSession = ctx.context.newSession;
        const userAgent = headers?.get("user-agent") ?? null;
        const ip = headers ? getIp(headers) : null;

        // Record the login session, device and events after the endpoint has
        // committed. Runs in the background so telemetry can never break auth.
        if (newSession && userAgent) {
          ctx.context.runInBackgroundOrAwait(
            (async () => {
              const parsed = parseUserAgent(userAgent);

              const [existingDevice] = await config.database
                .select({ id: UserDeviceTable.id })
                .from(UserDeviceTable)
                .where(
                  and(
                    eq(UserDeviceTable.userId, newSession.user.id),
                    eq(UserDeviceTable.fingerprint, parsed.fingerprint)
                  )
                )
                .limit(1);

              const device = await upsertUserDevice(config.database, {
                userId: newSession.user.id,
                fingerprint: parsed.fingerprint,
                browser: parsed.browser,
                os: parsed.os,
                deviceType: parsed.deviceType,
                firstSeenAt: new Date(),
                lastSeenAt: new Date(),
              });

              const inserted = await config.database
                .insert(UserSessionTable)
                .values({
                  userId: newSession.user.id,
                  deviceId: device?.id ?? null,
                  sessionId: newSession.session.id,
                  ipAddress: ip,
                  userAgent,
                  loginAt: new Date(),
                  lastSeenAt: new Date(),
                  expiresAt: newSession.session.expiresAt,
                })
                .onConflictDoNothing({ target: UserSessionTable.sessionId })
                .returning({ id: UserSessionTable.id });

              if (inserted.length === 0) return;

              await createUserEvent(config.database, {
                userId: newSession.user.id,
                event: "auth.login",
                sessionId: newSession.session.id,
                deviceId: device?.id ?? null,
                ipAddress: ip,
                userAgent,
              });

              if (newSession.session.impersonatedBy) {
                await createUserEvent(config.database, {
                  userId: newSession.user.id,
                  event: "admin.impersonation",
                  sessionId: newSession.session.id,
                  deviceId: device?.id ?? null,
                  ipAddress: ip,
                  userAgent,
                  metadata: {
                    impersonatedBy: newSession.session.impersonatedBy,
                  },
                });
                return;
              }

              if (existingDevice) return;

              await createUserEvent(config.database, {
                userId: newSession.user.id,
                event: "device.new_detected",
                sessionId: newSession.session.id,
                deviceId: device?.id ?? null,
                ipAddress: ip,
                userAgent,
              });

              if (config.isDev || !ip) return;

              const result = await config.mailHooks.sendNewDeviceLoginMail({
                to: newSession.user.email,
                userName: newSession.user.name,
                loginTimestamp: Date.now().toString(),
                deviceInfo: parsed.deviceType ?? "unknown",
                browser: [parsed.browser, parsed.os].filter(Boolean).join(" "),
                ipAddress: ip,
                approximateLocation: "not available",
                secureAccountUrl: `${config.siteUrl}/dashboard/settings/reset-password`,
              });

              assertMailSent(result);
            })()
          );
        }

        // failed sign in
        if (ctx.path.startsWith("/sign-in") && !newSession) {
          if (userAgent && ctx.context.returned instanceof APIError) {
            const email =
              typeof ctx.body?.email === "string" ? ctx.body.email : null;

            ctx.context.runInBackgroundOrAwait(
              createUserEvent(config.database, {
                email,
                event: "auth.login_failed",
                ipAddress: ip,
                userAgent,
              })
            );
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
                const { deviceType } = parseUserAgent(userAgent);

                await createUserEvent(config.database, {
                  userId: session.user.id,
                  event: "auth.password_changed",
                  ipAddress: ip,
                  userAgent,
                });

                const result = await config.mailHooks.sendPasswordChangedMail({
                  to: session.user.email,
                  userName: session.user.name,
                  changeTimestamp: Date.now().toString(),
                  ipAddress: ip,
                  deviceInfo: deviceType ?? "unknown",
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
      sendResetPassword: async ({ user, url }) => {
        try {
          await createUserEvent(config.database, {
            userId: user.id,
            email: user.email,
            event: "auth.password_reset",
          });
        } catch (error) {
          console.error("Failed to record password reset event", error);
        }

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
