import type { NextConfig } from "next";

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

export default withSerwist(nextConfig);
