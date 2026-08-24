import Image from "next/image";

import { Spinner } from "@workspace/ui/components/spinner";

import { env } from "@/lib/env";

import siteLogoSvg from "@/public/sitelogo.svg";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-md px-4">
        {/* Logo/Brand */}
        <div className="mb-12 flex flex-col items-center justify-center gap-4">
          <div className="flex aspect-square size-8 items-center justify-center">
            <Image
              src={siteLogoSvg}
              alt={`${env.NEXT_PUBLIC_SITE_NAME} logo`}
              unoptimized
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {env.NEXT_PUBLIC_SITE_NAME}
          </h1>
        </div>

        {/* Loading Spinner */}
        <div className="space-y-8">
          {/* Animated spinner */}
          <div className="flex justify-center">
            <Spinner className="size-16 text-primary" strokeWidth={1} />
          </div>

          {/* Loading message */}
          <div className="space-y-2 text-center">
            <p className="font-medium text-foreground">
              Finding your perfect service
            </p>
            <p className="text-center text-xs text-muted-foreground">
              This may take a moment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
