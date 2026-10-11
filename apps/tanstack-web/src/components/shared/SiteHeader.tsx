import { Link } from "@tanstack/react-router";

import { Button } from "@workspace/ui/components/button";
import { ThemeChanger } from "@workspace/ui/components/theme-changer";

import { HoverLift } from "../motions/HoverLift";
import { Container } from "../sections";
import { SiteLogo } from "../SiteLogo";
import { MobileNav } from "./MobileNav";
import { NavLinks } from "./NavLinks";

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
              render={<Link to="/contact" />}
              nativeButton={false}
              size="lg"
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
