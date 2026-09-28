import { NextRequest, NextResponse } from "next/server";

import { getSessionCookie } from "better-auth/cookies";

import { auth } from "@/lib/better-auth/auth";

import {
  DEFAULT_AUTH_PATH,
  DEFAULT_UNAUTH_PATH,
  isAuthPath,
  isPublicPath,
} from "@/constants";

async function getDbSession(headers: Headers) {
  return auth.api.getSession({
    headers,
    query: {
      disableCookieCache: true,
    },
  });
}

async function signOut(headers: Headers) {
  return auth.api.signOut({ headers });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = isPublicPath(pathname);
  const isAuthRoute = isAuthPath(pathname);

  const sessionCookie = getSessionCookie(request);

  try {
    const session = sessionCookie ? await getDbSession(request.headers) : null;

    // Invalid session cleanup
    if (sessionCookie && !session) {
      await signOut(request.headers);
      return NextResponse.redirect(new URL(DEFAULT_UNAUTH_PATH, request.url));
    }

    // Not authenticated
    if (!session && !isPublicRoute && !isAuthRoute) {
      await signOut(request.headers);
      const loginUrl = new URL(DEFAULT_UNAUTH_PATH, request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Auth user hitting auth pages
    if (session && isAuthRoute) {
      return NextResponse.redirect(new URL(DEFAULT_AUTH_PATH, request.url));
    }

    // ✅ Allow shared routes (no redirect)
    if (pathname.startsWith("/dashboard/settings")) {
      return NextResponse.next();
    }

    return NextResponse.next();
  } catch {
    if (sessionCookie) {
      await signOut(request.headers);
    }
    return NextResponse.redirect(new URL(DEFAULT_UNAUTH_PATH, request.url));
  }
}

export const config = {
  matcher: [
    /**
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - orpc (orpc routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|orpc|_next/static|_next/image|serwist|manifest.webmanifest|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
