"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@workspace/ui/lib/utils";

import { marketingNav } from "../content/site";

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
      {marketingNav.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-x-3 -bottom-px h-0.5 origin-left rounded-full bg-primary transition-transform duration-300 group-hover:scale-x-100",
                active ? "scale-x-100" : "scale-x-0"
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
