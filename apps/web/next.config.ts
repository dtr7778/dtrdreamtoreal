import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@workspace/ui",
    "@workspace/drizzle",
    "@workspace/lib",
    "@workspace/mail",
  ],
  typedRoutes: true,
  reactCompiler: true,
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;
