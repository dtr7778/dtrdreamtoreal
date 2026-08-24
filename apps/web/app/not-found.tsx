import type { Metadata } from "next";
import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-b from-background via-background to-muted/20">
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
        {/* Error number with gradient */}
        <div className="mb-2 bg-linear-to-r from-primary to-accent bg-clip-text text-9xl font-bold text-transparent">
          404<span className="text-destructive">!</span>
        </div>

        {/* Message */}
        <p className="mx-auto my-8 max-w-xl text-lg text-muted-foreground">
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </p>

        {/* CTA Button */}
        <Button
          size="lg"
          render={
            <Link href="/">
              <ArrowLeft className="size-4" />
              <span>Go Home</span>
            </Link>
          }
        />
      </div>
    </main>
  );
}
