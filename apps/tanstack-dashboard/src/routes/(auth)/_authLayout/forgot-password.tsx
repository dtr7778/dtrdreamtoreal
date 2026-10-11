import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import { ForgetPasswordForm } from "#/features/auth/components/forms/ForgetPasswordForm";
import { env } from "#/lib/env";

export const Route = createFileRoute("/(auth)/_authLayout/forgot-password")({
  head: () => ({
    meta: [
      {
        title: `Forgot Password | Authentication page - ${env.VITE_APP_NAME}`,
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <Card>
      <div className="-mb-6 px-6">
        <Link to="/sign-in">
          <ArrowLeft className="text-muted-foreground" />
        </Link>
      </div>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Forgot Your Password?</CardTitle>
        <CardDescription>
          No worries! Let&apos;s help you get back on track.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ForgetPasswordForm />
      </CardContent>
    </Card>
  );
}
