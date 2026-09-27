import type { Metadata } from "next";
import Link from "next/link";

import { ShieldAlert } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Audit Not Found",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <ShieldAlert className="size-7 text-destructive" />
      </div>
      <div className="space-y-1">
        <h1 className="font-heading text-xl font-bold text-foreground">
          Report unavailable
        </h1>
        <p className="text-sm text-muted-foreground">
          This audit report could not be found or the link has expired.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          nativeButton={false}
          render={<a href={`mailto:${env.SUPPORT_MAIL}`} />}
        >
          Contact us
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/" />}
        >
          Back to home
        </Button>
      </div>
    </div>
  );
}
