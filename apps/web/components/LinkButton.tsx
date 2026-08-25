import type { UrlObject } from "node:url";

import Link from "next/link";

import { Button, type ButtonProps } from "@workspace/ui/components/button";

import type { RoutePathType } from "@/types";

interface LinkButtonProps extends ButtonProps {
  href: RoutePathType | UrlObject;
}

export function LinkButton({
  variant = "ghost",
  href,
  ...props
}: LinkButtonProps) {
  return (
    <Button
      variant={variant}
      nativeButton={false}
      render={<Link href={href} />}
      {...props}
    />
  );
}
