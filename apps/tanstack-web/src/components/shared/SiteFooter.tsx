import {
  brand,
  contactDetails,
  footerColumns,
  socialLinks,
} from "#/constants/content";
import { Link } from "@tanstack/react-router";

import { Separator } from "@workspace/ui/components/separator";

import { Container } from "../sections";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden border-t border-border bg-muted/30">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 size-120 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <Container className="py-12 lg:py-16">
        <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-heading text-lg font-semibold text-foreground">
                {brand.name}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {brand.tagline}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <p className="text-xs font-semibold tracking-wide text-foreground uppercase">
                {column.title}
              </p>
              <ul className="flex flex-col gap-2">
                {column.items.map((item) => (
                  <li key={`${column.title}-${item.href}`}>
                    <Link
                      to={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col justify-between gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <p>
            &copy; {year} {brand.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a
              href={`mailto:${contactDetails.email}`}
              className="transition-colors hover:text-foreground"
            >
              {contactDetails.email}
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
