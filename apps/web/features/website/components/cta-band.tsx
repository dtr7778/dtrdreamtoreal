import Link from "next/link";

import { Check } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

import type { RoutePathType } from "@/types";

import { HoverLift, Reveal } from "./motion";
import { Container, Section } from "./section";
import { TextReveal } from "./text-reveal";

interface Cta {
  label: string;
  href: RoutePathType;
}

export function CtaBand({
  title,
  description,
  primary,
  secondary,
  bullets,
}: {
  title: string;
  description: string;
  primary?: Cta;
  secondary?: Cta;
  bullets?: Array<string>;
}) {
  return (
    <Section className="pb-0">
      <Container>
        <Reveal className="relative isolate overflow-hidden rounded-2xl bg-primary/50 px-6 py-12 text-center text-primary-foreground sm:px-12 lg:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-20 bg-[radial-gradient(circle_at_1px_1px,var(--background)_1px,transparent_0)] bg-size-[22px_22px]"
          />
          <TextReveal
            as="h2"
            by="word"
            className="font-heading mx-auto max-w-2xl text-2xl font-semibold text-balance sm:text-3xl"
          >
            {title}
          </TextReveal>
          <p className="mx-auto mt-3 max-w-xl text-sm/relaxed text-primary-foreground/80">
            {description}
          </p>
          {bullets?.length ? (
            <ul className="mx-auto mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
              {bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="inline-flex items-center gap-2 text-sm text-primary-foreground/90"
                >
                  <Check aria-hidden="true" className="size-4" />
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {primary ? (
              <HoverLift>
                <Button
                  render={<Link href={primary.href} />}
                  nativeButton={false}
                  className="h-10 px-5 text-sm"
                >
                  {primary.label}
                </Button>
              </HoverLift>
            ) : null}
            {secondary ? (
              <HoverLift>
                <Button
                  render={<Link href={secondary.href} />}
                  nativeButton={false}
                  variant="outline"
                  className="h-10 border-primary-foreground/40 px-5 text-sm text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  {secondary.label}
                </Button>
              </HoverLift>
            ) : null}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
