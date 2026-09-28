import { Check } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import { AuroraBackground } from "@/features/website/components/aurora-background";
import { CtaBand } from "@/features/website/components/cta-band";
import { GridPattern } from "@/features/website/components/decor";
import { LogoCloud } from "@/features/website/components/logo-cloud";
import {
  Reveal,
  StaggerGroup,
  StaggerItem,
} from "@/features/website/components/motion";
import {
  Container,
  Eyebrow,
  Section,
  SectionHeader,
} from "@/features/website/components/section";
import { ServiceIcon } from "@/features/website/components/service-icon";
import { StatBand } from "@/features/website/components/stat-band";
import { TextReveal } from "@/features/website/components/text-reveal";
import {
  aboutHero,
  aboutMission,
  aboutStats,
  aboutStory,
  aboutTeam,
  aboutValues,
} from "@/features/website/content/about";
import { clientLogos } from "@/features/website/content/home";
import { milestones } from "@/features/website/content/work";

const aboutHighlights = [
  { value: "6 yrs", label: "building for the web" },
  { value: "8", label: "specialists on the team" },
  { value: "6", label: "countries served" },
];

export const metadata = {
  title: "About Us",
  description:
    "Dream To Real is a software development and digital marketing studio. Learn our mission, values and the team behind DTR.",
};

export default function AboutPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <AuroraBackground />
        <GridPattern className="-z-10 animate-grid-drift motion-reduce:animate-none" />
        <Container className="flex flex-col items-start gap-5 py-16 sm:py-20 lg:py-24">
          <Reveal className="flex flex-col items-start gap-5" y={16}>
            <Eyebrow>{aboutHero.eyebrow}</Eyebrow>
            <TextReveal
              as="h1"
              by="word"
              className="font-heading max-w-3xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl"
            >
              {aboutHero.title}
            </TextReveal>
            <p className="max-w-2xl text-base/relaxed text-muted-foreground">
              {aboutHero.description}
            </p>
            <dl className="flex flex-wrap items-center gap-6 pt-3">
              {aboutHighlights.map((item) => (
                <div key={item.label} className="flex flex-col">
                  <dt className="font-heading text-xl font-semibold text-foreground">
                    {item.value}
                  </dt>
                  <dd className="text-xs text-muted-foreground">
                    {item.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      </section>

      <Section>
        <Container className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="flex flex-col gap-4">
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {aboutMission.title}
            </h2>
            {aboutMission.body.map((paragraph) => (
              <p
                key={paragraph}
                className="text-sm/relaxed text-muted-foreground sm:text-base/relaxed"
              >
                {paragraph}
              </p>
            ))}
          </Reveal>
          <Reveal
            className="rounded-xl border border-border bg-card p-8"
            delay={0.1}
          >
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {aboutStory.title}
            </h2>
            <div className="mt-4 flex flex-col gap-4">
              {aboutStory.body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-sm/relaxed text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <blockquote className="mt-6 border-s-2 border-primary ps-4 text-sm font-medium text-foreground italic">
              &ldquo;Great software and great search are the same discipline
              viewed from two angles.&rdquo;
            </blockquote>
          </Reveal>
        </Container>
      </Section>

      <Section className="border-t border-border bg-muted/30">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="What we value"
            title="Principles we build by"
            description="How we work is as important as what we ship."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {aboutValues.map((value) => (
              <Reveal
                key={value.title}
                hover
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ServiceIcon name={value.icon} className="size-5" />
                </div>
                <h3 className="font-heading text-base font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="text-sm/relaxed text-muted-foreground">
                  {value.description}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border">
        <Container className="flex flex-col gap-10">
          <SectionHeader
            eyebrow="By the numbers"
            title="A small team with a wide reach"
          />
          <StatBand stats={aboutStats} />
        </Container>
      </Section>

      <Section className="border-t border-border bg-muted/30">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Our team"
            title="The people behind your project"
            description="Specialists across engineering, design, growth and AI search."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {aboutTeam.map((member) => (
              <Reveal key={member.name} hover className="h-full">
                <Card className="h-full gap-3 p-6 ring-border">
                  <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                    {member.name.charAt(0)}
                  </span>
                  <CardHeader className="p-0">
                    <CardTitle className="font-heading text-base font-semibold">
                      {member.name}
                    </CardTitle>
                    <p className="text-xs font-medium text-primary">
                      {member.role}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-3 p-0">
                    <p className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-primary"
                      />
                      {member.focus}
                    </p>
                    <span className="mt-auto inline-flex w-fit items-center rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[0.65rem] font-medium text-muted-foreground">
                      {member.location}
                    </span>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            eyebrow="Milestones"
            title="How we got here"
            description="From two people and a laptop to a full-stack studio."
          />
          <StaggerGroup
            as="ol"
            className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {milestones.map((milestone) => (
              <StaggerItem
                as="li"
                key={milestone.year}
                hover
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6"
              >
                <span className="font-heading text-2xl font-semibold text-primary">
                  {milestone.year}
                </span>
                <h3 className="font-heading text-base font-semibold text-foreground">
                  {milestone.title}
                </h3>
                <p className="text-sm/relaxed text-muted-foreground">
                  {milestone.description}
                </p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </Section>

      <Section className="border-t border-border bg-muted/30">
        <Container className="flex flex-col gap-8">
          <p className="text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Brands we have worked with
          </p>
          <LogoCloud logos={clientLogos} />
        </Container>
      </Section>

      <Section className="border-t border-border">
        <CtaBand
          title="Let's build something real together"
          description="Share your goals and we will tell you honestly whether we can help."
          primary={{ label: "Contact us", href: "/contact" }}
          secondary={{ label: "Explore services", href: "/services" }}
        />
      </Section>
    </>
  );
}
