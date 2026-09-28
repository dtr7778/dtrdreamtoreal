import Link from "next/link";

import { Check } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";

import { AuroraBackground } from "@/features/website/components/aurora-background";
import { CtaBand } from "@/features/website/components/cta-band";
import { GridPattern } from "@/features/website/components/decor";
import { FaqAccordion } from "@/features/website/components/faq-accordion";
import { Reveal } from "@/features/website/components/motion";
import { ProcessTimeline } from "@/features/website/components/process-timeline";
import {
  Container,
  Eyebrow,
  Section,
  SectionHeader,
} from "@/features/website/components/section";
import { ServiceCard } from "@/features/website/components/service-card";
import { ServiceIcon } from "@/features/website/components/service-icon";
import { TextReveal } from "@/features/website/components/text-reveal";
import { homeFaqs } from "@/features/website/content/home";
import {
  addOns,
  assurances,
  engagementTiers,
  searchChannels,
  services,
} from "@/features/website/content/services";

export const metadata = {
  title: "Services",
  description:
    "Web and software development, SEO, AIO/AEO/GEO, audits and growth retainers. Explore what DTR can do for your business.",
};

const serviceHighlights = [
  "Performance budgets",
  "WCAG-minded builds",
  "AI-search ready",
];

export default function ServicesPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <AuroraBackground />
        <GridPattern className="-z-10 animate-grid-drift motion-reduce:animate-none" />
        <Container className="flex flex-col items-start gap-5 py-16 sm:py-20 lg:py-24">
          <Reveal className="flex flex-col items-start gap-5" y={16}>
            <Eyebrow>Services</Eyebrow>
            <TextReveal
              as="h1"
              by="word"
              className="font-heading max-w-3xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl"
            >
              Build the product. Own the search results.
            </TextReveal>
            <p className="max-w-2xl text-base/relaxed text-muted-foreground">
              Five ways we help businesses ship better software and get found by
              the people — and machines — that matter.
            </p>
            <ul className="flex flex-wrap gap-2 pt-1">
              {serviceHighlights.map((item) => (
                <li
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
                >
                  <Check aria-hidden="true" className="size-3.5 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <Button
              render={<Link href="/contact" />}
              nativeButton={false}
              className="h-10 px-5 text-sm"
            >
              Get a free audit
            </Button>
          </Reveal>
        </Container>
      </section>

      <Section>
        <Container className="grid gap-6 md:grid-cols-2">
          {services.map((service, index) => (
            <ServiceCard
              key={service.slug}
              service={service}
              index={index}
              showDeliverables
            />
          ))}
        </Container>
      </Section>

      <Section className="border-t border-border bg-muted/30">
        <Container className="flex flex-col gap-10">
          <SectionHeader
            eyebrow="Why work with us"
            title="Guarantees, not vague promises"
            description="The commitments that come standard with every engagement."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {assurances.map((item) => (
              <Reveal
                key={item.title}
                hover
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ServiceIcon name={item.icon} className="size-5" />
                </div>
                <h3 className="font-heading text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm/relaxed text-muted-foreground">
                  {item.description}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Two channels, one strategy"
            title="Ranked links and AI answers"
            description="Modern discovery runs on both. We build for each, together."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {searchChannels.map((channel) => (
              <Reveal
                key={channel.name}
                hover
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ServiceIcon name={channel.icon} className="size-5" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  {channel.name}
                </h3>
                <p className="text-sm/relaxed text-muted-foreground">
                  {channel.description}
                </p>
                <ul className="mt-auto flex flex-col gap-2">
                  {channel.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm">
                      <Check
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-primary"
                      />
                      <span className="text-muted-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border bg-muted/30">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Engagements"
            title="Ways to work with us"
            description="Start with a project, grow with a retainer, or scale with a dedicated team."
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {engagementTiers.map((tier) => (
              <Reveal key={tier.name} hover className="h-full">
                <Card
                  className={cn(
                    "h-full gap-5 p-6 ring-border",
                    tier.highlighted && "ring-2 ring-primary"
                  )}
                >
                  <CardHeader className="gap-2 p-0">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="font-heading text-lg font-semibold">
                        {tier.name}
                      </CardTitle>
                      {tier.highlighted ? <Badge>Popular</Badge> : null}
                    </div>
                    <p className="font-heading text-2xl font-semibold text-foreground">
                      {tier.price}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {tier.description}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4 p-0">
                    <ul className="flex flex-col gap-2">
                      {tier.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm"
                        >
                          <Check
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-primary"
                          />
                          <span className="text-muted-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      render={<Link href="/contact" />}
                      nativeButton={false}
                      variant={tier.highlighted ? "default" : "outline"}
                      className="h-10 w-full text-sm"
                    >
                      Choose {tier.name}
                    </Button>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Every engagement starts with a free discovery call and a written
            scope. Prices are indicative and confirmed after scoping.
          </p>
        </Container>
      </Section>

      <Section className="border-t border-border">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            align="start"
            eyebrow="Add-ons"
            title="Extras you can bolt on"
            description="Round out a project or retainer with specialist work."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {addOns.map((addOn) => (
              <Reveal
                key={addOn.title}
                hover
                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6"
              >
                <h3 className="font-heading text-base font-semibold text-foreground">
                  {addOn.title}
                </h3>
                <p className="text-sm/relaxed text-muted-foreground">
                  {addOn.description}
                </p>
                <p className="font-heading mt-auto pt-2 text-sm font-semibold text-primary">
                  {addOn.price}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Our process"
            title="How an engagement runs"
            description="Transparent, milestone-driven, and built to keep you in the loop."
          />
          <ProcessTimeline />
        </Container>
      </Section>

      <Section className="border-t border-border bg-muted/30">
        <Container className="flex flex-col gap-10">
          <SectionHeader eyebrow="FAQ" title="Service questions" />
          <Reveal>
            <FaqAccordion faqs={homeFaqs} />
          </Reveal>
        </Container>
      </Section>

      <Section className="border-t border-border">
        <CtaBand
          title="Not sure which service you need?"
          description="Send us your site or idea. We will audit it and recommend the shortest path to results."
          primary={{ label: "Book a free audit", href: "/contact" }}
          secondary={{ label: "About DTR", href: "/about" }}
        />
      </Section>
    </>
  );
}
