import Link from "next/link";

import { ArrowRight, Check, ShieldCheck, TrendingUp } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";

import { env } from "@/lib/env";

import { AuroraBackground } from "@/features/website/components/aurora-background";
import { CaseStudyCard } from "@/features/website/components/case-study-card";
import { CtaBand } from "@/features/website/components/cta-band";
import {
  GlowOrb,
  GridPattern,
  SpinGlow,
} from "@/features/website/components/decor";
import { FaqAccordion } from "@/features/website/components/faq-accordion";
import { Float } from "@/features/website/components/float";
import { LogoCloud } from "@/features/website/components/logo-cloud";
import { Marquee } from "@/features/website/components/marquee";
import {
  HoverLift,
  Reveal,
  StaggerGroup,
  StaggerItem,
} from "@/features/website/components/motion";
import { ProcessTimeline } from "@/features/website/components/process-timeline";
import { ScrollCue } from "@/features/website/components/scroll-cue";
import {
  Container,
  Eyebrow,
  Section,
  SectionHeader,
} from "@/features/website/components/section";
import { ServiceCard } from "@/features/website/components/service-card";
import { ServiceIcon } from "@/features/website/components/service-icon";
import { StarRating } from "@/features/website/components/star-rating";
import { StatBand } from "@/features/website/components/stat-band";
import { TechStack } from "@/features/website/components/tech-stack";
import { TestimonialCard } from "@/features/website/components/testimonial-card";
import { TextReveal } from "@/features/website/components/text-reveal";
import {
  bentoCapabilities,
  clientLogos,
  ctaChecklist,
  faqSupport,
  heroMarquee,
  heroProof,
  homeFaqs,
  homeHero,
  testimonials,
  trustStats,
  whyUs,
} from "@/features/website/content/home";
import { services } from "@/features/website/content/services";
import { brand } from "@/features/website/content/site";
import { caseStudies, techStackGroups } from "@/features/website/content/work";

export const metadata = {
  title: "Software Development & Digital Marketing Agency",
  description:
    "DTR builds web products and makes them discoverable with SEO, AIO, AEO and GEO. From idea to production, and from page one to AI answers.",
};

const auditScores = [
  { label: "Performance", value: 96 },
  { label: "SEO", value: 92 },
  { label: "Accessibility", value: 88 },
  { label: "Best practices", value: 90 },
];

const proofAvatars = ["A", "D", "M", "S"];

function AuditPreview() {
  return (
    <div className="relative">
      <SpinGlow className="-inset-8" />
      <GlowOrb className="-inset-6 -z-10 size-auto" color="primary" />
      <Card className="w-full gap-5 p-6 ring-border shadow-xl">
        <CardHeader className="flex-row items-center justify-between gap-2 p-0">
          <div>
            <p className="font-heading text-base font-semibold text-foreground">
              Site audit
            </p>
            <p className="text-xs text-muted-foreground">dreamtoreal.dev</p>
          </div>
          <Badge variant="secondary">Live</Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-0">
          {auditScores.map((score) => (
            <div key={score.label} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{score.label}</span>
                <span className="font-medium text-foreground">
                  {score.value}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${score.value}%` }}
                />
              </div>
            </div>
          ))}
          <div className="mt-1 flex items-center justify-between rounded-lg bg-muted/60 px-4 py-3">
            <span className="text-xs text-muted-foreground">Overall score</span>
            <span className="font-heading text-2xl font-semibold text-primary">
              92
            </span>
          </div>
        </CardContent>
      </Card>

      <Float
        className="absolute -bottom-8 -inset-e-4 hidden items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-lg sm:flex"
        delay={0.8}
        distance={5}
      >
        <TrendingUp aria-hidden="true" className="size-4 text-primary" />
        <div>
          <p className="text-xs font-semibold text-foreground">+18%</p>
          <p className="text-[0.65rem] text-muted-foreground">
            organic traffic
          </p>
        </div>
      </Float>
      <Float
        className="absolute -top-8 -inset-s-4 hidden items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-lg sm:flex"
        delay={0.5}
        distance={5}
      >
        <ShieldCheck aria-hidden="true" className="size-4 text-primary" />
        <div>
          <p className="text-xs font-semibold text-foreground">WCAG AA</p>
          <p className="text-[0.65rem] text-muted-foreground">accessibility</p>
        </div>
      </Float>
    </div>
  );
}

function TrustProof() {
  return (
    <div className="flex flex-wrap items-center gap-4 pt-2">
      <div className="flex -space-x-2">
        {proofAvatars.map((initial) => (
          <span
            key={initial}
            className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary/10 text-xs font-semibold text-primary"
          >
            {initial}
          </span>
        ))}
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <StarRating rating={5} />
          <span className="text-sm font-semibold text-foreground">
            {heroProof.rating}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {heroProof.reviews} reviews · {heroProof.label}
        </span>
      </div>
      <div className="hidden items-center gap-4 border-s border-border ps-4 sm:flex">
        {heroProof.stats.map((stat) => (
          <div key={stat.label} className="flex flex-col">
            <span className="font-heading text-sm font-semibold text-foreground">
              {stat.value}
            </span>
            <span className="text-[0.65rem] text-muted-foreground">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.name,
    url: env.NEXT_PUBLIC_SITE_URL,
    description:
      "Software development and digital marketing studio offering SEO, AIO, AEO and GEO services.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="relative isolate overflow-hidden border-b border-border">
        <AuroraBackground />
        <GridPattern className="-z-10 animate-grid-drift motion-reduce:animate-none" />
        <Container className="grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <Reveal className="flex flex-col items-start gap-6" y={16}>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Available for new projects
            </div>
            <Eyebrow>{homeHero.eyebrow}</Eyebrow>
            <TextReveal
              as="h1"
              by="char"
              className="font-heading max-w-2xl text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-6xl lg:text-7xl"
            >
              {homeHero.title}
            </TextReveal>
            <p className="max-w-xl text-base/relaxed text-muted-foreground sm:text-lg/relaxed">
              {homeHero.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <HoverLift>
                <Button
                  render={<Link href={homeHero.primaryCta.href} />}
                  nativeButton={false}
                  className="h-11 px-6 text-sm shadow-sm"
                >
                  {homeHero.primaryCta.label}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Button>
              </HoverLift>
              <HoverLift>
                <Button
                  render={<Link href={homeHero.secondaryCta.href} />}
                  nativeButton={false}
                  variant="outline"
                  className="h-11 px-6 text-sm"
                >
                  {homeHero.secondaryCta.label}
                </Button>
              </HoverLift>
            </div>
            <ul className="flex flex-wrap gap-2 pt-1">
              {homeHero.highlights.map((item) => (
                <li
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
                >
                  <Check aria-hidden="true" className="size-3.5 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <TrustProof />
          </Reveal>

          <Reveal
            className="mx-auto w-full max-w-md lg:max-w-none"
            delay={0.15}
            y={16}
          >
            <AuditPreview />
          </Reveal>
        </Container>
        <ScrollCue />
      </section>

      <div className="border-b border-border bg-card/40 py-5">
        <Marquee items={heroMarquee} />
      </div>

      <Section className="py-12 sm:py-14">
        <Container className="flex flex-col gap-6">
          <p className="text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Trusted by teams shipping on the web
          </p>
          <LogoCloud logos={clientLogos} />
          <p className="text-center text-xs text-muted-foreground">
            From seed-stage startups to established brands across 6 countries.
          </p>
        </Container>
      </Section>

      <Section className="border-t border-border">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            align="start"
            eyebrow="Capabilities"
            title="Everything needed to launch and grow"
            description="A single studio covering the full journey from a blank repo to page one and AI answers."
            action={
              <Button
                render={<Link href="/services" />}
                nativeButton={false}
                variant="outline"
                className="h-10 px-5 text-sm"
              >
                View all services
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
            }
          />
          <StaggerGroup className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bentoCapabilities.map((capability) => (
              <StaggerItem
                key={capability.title}
                hover
                className={cn(
                  "group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6",
                  capability.span
                )}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-e-16 -top-16 size-40 rounded-full bg-primary/5 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ServiceIcon name={capability.icon} className="size-5" />
                  </div>
                  {capability.tag ? (
                    <Badge variant="outline">{capability.tag}</Badge>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    {capability.title}
                  </h3>
                  <p className="text-sm/relaxed text-muted-foreground">
                    {capability.description}
                  </p>
                </div>
                {capability.stat ? (
                  <div className="mt-auto flex items-baseline gap-2 pt-2">
                    <span className="font-heading text-4xl font-semibold text-primary">
                      {capability.stat.value}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {capability.stat.label}
                    </span>
                  </div>
                ) : null}
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </Section>

      <Section className="border-t border-border bg-muted/30">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            align="start"
            eyebrow="Services"
            title="One studio for building and being found"
            description="Product development and search growth are designed together, so nothing gets lost between teams."
            action={
              <Button
                render={<Link href="/services" />}
                nativeButton={false}
                variant="outline"
                className="h-10 px-5 text-sm"
              >
                All services
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
            }
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <ServiceCard key={service.slug} service={service} index={index} />
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            align="start"
            eyebrow="Selected work"
            title="Projects with measurable outcomes"
            description="A snapshot of recent engagements across commerce, SaaS, fintech and health."
            action={
              <Button
                render={<Link href="/contact" />}
                nativeButton={false}
                variant="outline"
                className="h-10 px-5 text-sm"
              >
                Start a project
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
            }
          />
          <div className="grid gap-6 md:grid-cols-2">
            {caseStudies.map((study) => (
              <CaseStudyCard key={study.slug} study={study} />
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border bg-muted/30">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <SectionHeader
            align="start"
            eyebrow="Why DTR"
            title="Build it right, then make it impossible to miss"
            description="We combine engineering discipline with search expertise, so your product performs and your audience finds it."
          />
          <div className="grid gap-6 sm:grid-cols-2">
            {whyUs.map((item) => (
              <Reveal key={item.title} hover className="flex flex-col gap-3">
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
            eyebrow="How we work"
            title="A clear path from dream to real"
            description="Every engagement follows the same rhythm, whether it is a new build or a search turnaround."
          />
          <ProcessTimeline />
        </Container>
      </Section>

      <Section className="border-t border-border bg-muted/30">
        <Container className="flex flex-col gap-10">
          <SectionHeader
            eyebrow="By the numbers"
            title="Outcomes we are proud of"
            description="Representative results from recent client engagements."
          />
          <StatBand stats={trustStats} />
        </Container>
      </Section>

      <Section className="border-t border-border">
        <Container className="flex flex-col gap-10">
          <SectionHeader
            eyebrow="Our stack"
            title="Tools we trust in production"
            description="Boring, reliable technology chosen for maintainability and speed."
          />
          <TechStack groups={techStackGroups} />
        </Container>
      </Section>

      <Section className="border-t border-border bg-muted/30">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Testimonials"
            title="What our clients say"
            description="Long-term partnerships built on shipping and measurable results."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.name} {...testimonial} />
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div className="flex flex-col gap-6 lg:sticky lg:top-24">
            <SectionHeader
              align="start"
              eyebrow="FAQ"
              title="Questions, answered"
              description="Still unsure? Send us a message and we will reply within a business day."
            />
            <Card className="gap-4 p-6 ring-border">
              <h3 className="font-heading text-base font-semibold text-foreground">
                {faqSupport.title}
              </h3>
              <p className="text-sm/relaxed text-muted-foreground">
                {faqSupport.description}
              </p>
              <ul className="flex flex-col gap-2">
                {faqSupport.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-primary"
                    />
                    {bullet}
                  </li>
                ))}
              </ul>
              <Button
                render={<Link href={faqSupport.cta.href} />}
                nativeButton={false}
                className="h-10 w-full gap-2 text-sm"
              >
                {faqSupport.cta.label}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
            </Card>
          </div>
          <Reveal>
            <FaqAccordion faqs={homeFaqs} />
          </Reveal>
        </Container>
      </Section>

      <Section className="border-t border-border">
        <CtaBand
          title="Ready to turn your idea into something real?"
          description="Tell us what you are building. We will reply with next steps, a timeline and an honest opinion."
          bullets={ctaChecklist}
          primary={{ label: "Start a project", href: "/contact" }}
          secondary={{ label: "See services", href: "/services" }}
        />
      </Section>
    </>
  );
}
