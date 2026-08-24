import { type Metadata } from "next";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import ResetPasswordForm from "@/features/auth/components/forms/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ResetPassword(
  props: PageProps<"/reset-password">
) {
  const searchParams = await props.searchParams;

  const error = searchParams?.error as string | undefined;
  const token = searchParams?.token as string | undefined;

  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="rounded-md border-2 border-red-600 bg-destructive p-4 text-center text-xl font-medium text-white shadow-md">
            Something went wrong
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!token) {
    return (
      <Card>
        <CardContent>
          <div className="text-center text-xl font-semibold text-destructive">
            &apos;token&apos; is not found in search | query params
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Reset Password?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ResetPasswordForm token={token} />
      </CardContent>
    </Card>
  );
}
