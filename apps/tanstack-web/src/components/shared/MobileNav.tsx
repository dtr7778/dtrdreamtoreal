import { legalNav, marketingNav } from "#/constants/content";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon-lg"
            className="md:hidden"
            aria-label="Open menu"
          />
        }
      >
        <Menu aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle className="text-base">Menu</SheetTitle>
        </SheetHeader>
        <nav aria-label="Mobile" className="flex flex-col gap-1 px-6">
          {marketingNav.map((item) => (
            <SheetClose
              key={item.href}
              render={<Link to={item.href} />}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {item.label}
            </SheetClose>
          ))}
        </nav>
        <Separator className="my-4" />
        <div className="flex flex-col gap-1 px-6">
          {legalNav.map((item) => (
            <SheetClose
              key={item.href}
              nativeButton={false}
              render={<Link to={item.href} />}
              className="rounded-md px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </SheetClose>
          ))}
        </div>
        <div className="mt-auto p-6">
          <Button
            nativeButton={false}
            size="lg"
            render={<Link to="/contact" />}
          >
            Get a free audit
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
