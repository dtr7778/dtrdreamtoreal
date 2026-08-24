import { type Metadata } from "next";
import Link from "next/link";

import { FieldDescription } from "@workspace/ui/components/field";

import { env } from "@/lib/env";

import SiteLogo from "@/components/SiteLogo";

import { AuthBackgroundShape } from "@/features/auth/components/auth-background-shape";

export const metadata: Metadata = {
  title: {
    default: `${env.NEXT_PUBLIC_SITE_NAME} - Authentication page`,
    template: `%s | Authentication page - ${env.NEXT_PUBLIC_SITE_NAME}`,
  },
  description: "Authentication pages for Smart Service",
};

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SiteLogo />
        <AuthBackgroundShape className="fixed w-full h-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-1" />
        <div className="z-1">{children}</div>
        <FieldDescription className="px-6 text-center">
          By clicking continue, you agree to our{" "}
          <Link className="link" href="#">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link className="link" href="#">
            Privacy Policy
          </Link>
        </FieldDescription>
      </div>
    </div>
  );
}
