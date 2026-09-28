import Link from "next/link";

import { Button } from "@workspace/ui/components/button";

import SiteLogo from "@/components/SiteLogo";
import { ThemeChanger } from "@/components/ThemeChanger";

import { MobileNav } from "./mobile-nav";
import { HoverLift } from "./motion";
import { NavLinks } from "./nav-links";
import { Container } from "./section";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between gap-4">
        <SiteLogo />

        <NavLinks />

        <div className="flex items-center gap-2">
          <ThemeChanger />
          <HoverLift className="hidden md:block">
            <Button
              render={<Link href="/contact" />}
              nativeButton={false}
              className="h-9 px-4 text-sm shadow-sm"
            >
              Get a free audit
            </Button>
          </HoverLift>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
