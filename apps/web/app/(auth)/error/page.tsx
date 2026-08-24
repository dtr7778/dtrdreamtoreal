import { type Metadata } from "next";
import Link from "next/link";

import { AlertCircle } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card";

import { authErrors } from "@/constants/authErrors";

export const metadata: Metadata = {
  title: "Error Page",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AuthErrorPage(props: PageProps<"/error">) {
  const searchParams = await props.searchParams;

  const error = searchParams.error as keyof typeof authErrors;

  const errorInfo = authErrors[error] || {
    title: "Authentication Error",
    message: "An unexpected error occurred during authentication.",
  };

  return (
    <Card>
      <div className="flex flex-col items-center justify-center">
        <AlertCircle className="size-12 text-destructive" />
        <h2 className="mb-2 text-2xl font-bold text-destructive">
          {errorInfo.title}
        </h2>
      </div>
      <CardContent className="my-4 text-center">
        <p className="mb-4 text-muted-foreground">{errorInfo.message}</p>
        <p className="mt-4 text-xs text-gray-400">{`Error code: ${error}`}</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          className="flex-1"
          render={<Link href="/login">Return to Login</Link>}
        />
        <Button
          className="flex-1"
          variant="outline"
          render={<Link href="/">Go to Homepage</Link>}
        />
      </CardFooter>
    </Card>
  );
}
