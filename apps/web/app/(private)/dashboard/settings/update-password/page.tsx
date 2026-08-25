import { Metadata } from "next";
import { headers } from "next/headers";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import { auth } from "@/lib/better-auth/auth";

import UpdatePasswordForm from "@/features/auth/components/forms/UpdatePasswordForm";
import SetPasswordButton from "@/features/auth/components/SetPasswordButton";

export const metadata: Metadata = {
  title: "Update Password",
};

export default async function UpdatePassword() {
  const accounts = await auth.api.listUserAccounts({
    headers: await headers(),
  });

  const hasPasswordAccount = accounts.some(
    (a) => a.providerId === "credential"
  );

  return (
    <div>
      {hasPasswordAccount ? (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password for improved security.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpdatePasswordForm />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Set Password</CardTitle>
            <CardDescription>
              We will send you a password reset email to set up a password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SetPasswordButton />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
