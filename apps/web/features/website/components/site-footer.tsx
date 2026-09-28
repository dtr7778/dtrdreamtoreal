import Link from "next/link";

import { Separator } from "@workspace/ui/components/separator";

import { env } from "@/lib/env";

import {
  brand,
  contactDetails,
  footerColumns,
  socialLinks,
} from "../content/site";
import { NewsletterForm } from "./newsletter-form";
import { Container } from "./section";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden border-t border-border bg-muted/30">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 size-120 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <Container className="py-12 lg:py-16">
        <div className="grid gap-10 rounded-2xl border border-border bg-card p-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
              Monthly notes on SEO, AI search and shipping
            </h2>
            <p className="mt-2 text-sm/relaxed text-muted-foreground">
              Practical tips from the DTR team. No spam, unsubscribe anytime.
            </p>
          </div>
          <div className="lg:justify-self-end">
            <NewsletterForm recipientEmail={env.SUPPORT_MAIL} />
          </div>
        </div>

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
                      href={item.href}
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
            <a
              href={`tel:${contactDetails.phone.replace(/\s/g, "")}`}
              className="transition-colors hover:text-foreground"
            >
              {contactDetails.phone}
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
