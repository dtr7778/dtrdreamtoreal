import type { NextConfig } from "next";

import { withSentryConfig } from "@sentry/nextjs/config";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@workspace/ui",
    "@workspace/drizzle",
    "@workspace/redis",
    "@workspace/lib",
    "@workspace/mail",
    "@workspace/contract",
    "@workspace/auth",
    "@workspace/ai",
    "@workspace/sentry",
  ],
  allowedDevOrigins:
    process.env.NODE_ENV === "development" ? [process.env.NGROK_URL!] : [],
  typedRoutes: true,
  reactCompiler: true,
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "54321",
        pathname: "/storage/v1/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/v1/**",
      },
    ],
  },
};

const authToken = process.env.SENTRY_AUTH_TOKEN;

export default withSentryConfig(withSerwist(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  release: { name: process.env.SENTRY_RELEASE },
  sourcemaps: { disable: !authToken },
});
