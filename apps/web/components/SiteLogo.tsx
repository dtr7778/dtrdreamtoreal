import Image from "next/image";
import Link from "next/link";

import { cn } from "@workspace/ui/lib/utils";

import { env } from "@/lib/env";

import siteLogoSvg from "@/public/sitelogo.svg";

export default function SiteLogo() {
  return (
    <Link
      href={{
        pathname: "/",
      }}
      className={cn("flex items-center gap-2 self-center font-semibold")}
    >
      <div className="flex aspect-square size-8 items-center justify-center">
        <Image
          src={siteLogoSvg}
          alt={`${env.NEXT_PUBLIC_SITE_NAME} logo`}
          unoptimized
        />
      </div>
      <span>{env.NEXT_PUBLIC_SITE_NAME}</span>
    </Link>
  );
}
