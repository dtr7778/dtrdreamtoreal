import { type Metadata } from "next";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import { DEFAULT_AUTH_PATH } from "@/constants";
import LoginForm from "@/features/auth/components/forms/LoginForm";
import SocialAuth from "@/features/auth/components/SocialAuth";

export const metadata: Metadata = {
  title: "Login",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;

  const redirectUrl =
    (searchParams?.redirect as string | undefined) ?? DEFAULT_AUTH_PATH;

  const invitationId = searchParams?.invitationId as string | undefined;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back!</CardTitle>
        <CardDescription>
          Sign in to access your account and continue your journey.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SocialAuth redirect={redirectUrl} invitationId={invitationId} />
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <LoginForm redirect={redirectUrl} invitationId={invitationId} />
      </CardContent>
      <CardFooter>
        <div className="w-full text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href={{
              pathname: "/register",
              ...(invitationId ? { query: { invitationId } } : {}),
            }}
            className="link"
          >
            Register
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
