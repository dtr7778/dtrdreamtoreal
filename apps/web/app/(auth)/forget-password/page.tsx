import { type Metadata } from "next";
import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import ForgetPasswordForm from "@/features/auth/components/forms/ForgetPasswordForm";

export const metadata: Metadata = {
  title: "Forget Password",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgetPasswordPage() {
  return (
    <Card>
      <div className="-mb-6 px-6">
        <Link href={{ pathname: "/login" }}>
          <ArrowLeft className="text-muted-foreground" />
        </Link>
      </div>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Forgot Your Password?</CardTitle>
        <CardDescription>
          No worries! Let{`'`}s help you get back on track.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ForgetPasswordForm />
      </CardContent>
    </Card>
  );
}
