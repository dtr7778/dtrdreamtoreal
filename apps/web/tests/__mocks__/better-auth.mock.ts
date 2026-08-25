import crypto from "node:crypto";

import type { AuthSession, AuthUser } from "@/types";

export function mockAuthSession(
  overrides: Partial<AuthSession> = {}
): AuthSession {
  return {
    id: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    token: "test",
    ipAddress: "test",
    userAgent: "test",
    impersonatedBy: crypto.randomUUID(),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    createdAt: new Date(),
    ...overrides,
  };
}

export function mockAuthUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
    email: "[EMAIL_ADDRESS]",
    emailVerified: true,
    name: "Test User",
    image: "test",
    banned: false,
    role: "user",
    banReason: null,
    banExpires: null,
    ...overrides,
  };
}

export function mockSessionWithUser(
  overrides: {
    session?: Partial<AuthSession>;
    user?: Partial<AuthUser>;
  } = {}
) {
  return {
    session: mockAuthSession(overrides.session),
    user: mockAuthUser(overrides.user),
  };
}
