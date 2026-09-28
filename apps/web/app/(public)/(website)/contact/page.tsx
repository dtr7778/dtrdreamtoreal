import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";

import { env } from "@/lib/env";

import { AuroraBackground } from "@/features/website/components/aurora-background";
import { ContactForm } from "@/features/website/components/contact-form";
import { GridPattern } from "@/features/website/components/decor";
import { FaqAccordion } from "@/features/website/components/faq-accordion";
import { Reveal } from "@/features/website/components/motion";
import {
  Container,
  Eyebrow,
  Section,
  SectionHeader,
} from "@/features/website/components/section";
import { TextReveal } from "@/features/website/components/text-reveal";
import {
  contactAssurances,
  contactFaqs,
  contactHero,
  contactHours,
  contactMethods,
} from "@/features/website/content/contact";
import { contactDetails, socialLinks } from "@/features/website/content/site";

export const metadata = {
  title: "Contact Us",
  description:
    "Contact DTR - Dream To Real about web development, software, SEO or AI search projects. We reply within one business day.",
};

const methodIcons = {
  email: Mail,
  phone: Phone,
  office: MapPin,
} as const;

export default function ContactPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <AuroraBackground />
        <GridPattern className="-z-10 animate-grid-drift motion-reduce:animate-none" />
        <Container className="flex flex-col items-start gap-5 py-16 sm:py-20 lg:py-24">
          <Reveal className="flex flex-col items-start gap-5" y={16}>
            <Eyebrow>{contactHero.eyebrow}</Eyebrow>
            <TextReveal
              as="h1"
              by="word"
              className="font-heading max-w-3xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl"
            >
              {contactHero.title}
            </TextReveal>
            <p className="max-w-2xl text-base/relaxed text-muted-foreground">
              {contactHero.description}
            </p>
            <ul className="grid gap-3 pt-2 sm:grid-cols-3">
              {contactAssurances.map((item) => (
                <li
                  key={item.title}
                  className="rounded-lg border border-border bg-card/60 p-4 backdrop-blur"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>

      <Section>
        <Container className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <Reveal>
            <ContactForm recipientEmail={env.SUPPORT_MAIL} />
          </Reveal>

          <Reveal className="flex flex-col gap-6" delay={0.1}>
            <Card className="gap-5 p-6 ring-border">
              <CardHeader className="p-0">
                <p className="font-heading text-base font-semibold text-foreground">
                  Contact details
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-5 p-0">
                {contactMethods.map((method) => {
                  const Icon =
                    methodIcons[method.key as keyof typeof methodIcons];
                  return (
                    <div key={method.key} className="flex items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon aria-hidden="true" className="size-4" />
                      </span>
                      <div>
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          {method.label}
                        </p>
                        {method.href ? (
                          <a
                            href={method.href}
                            className="text-sm font-medium text-foreground hover:text-primary"
                          >
                            {method.value}
                          </a>
                        ) : (
                          <p className="text-sm font-medium text-foreground">
                            {method.value}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {method.hint}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="gap-4 p-6 ring-border">
              <CardHeader className="flex-row items-center gap-2 p-0">
                <Clock aria-hidden="true" className="size-4 text-primary" />
                <p className="font-heading text-base font-semibold text-foreground">
                  {contactHours.title}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 p-0">
                {contactHours.rows.map((row) => (
                  <div
                    key={row.day}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{row.day}</span>
                    <span className="font-medium text-foreground">
                      {row.time}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section className="border-t border-border">
        <Container>
          <Reveal className="relative isolate overflow-hidden rounded-2xl border border-border bg-card">
            <GridPattern className="z-0 opacity-60" size={40} />
            <div className="relative z-10 flex flex-col items-start gap-4 p-8 sm:p-12">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin aria-hidden="true" className="size-5" />
              </span>
              <h2 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
                Visit the studio
              </h2>
              <p className="max-w-md text-sm/relaxed text-muted-foreground">
                {contactDetails.address.join(", ")}. Meetings are by appointment
                — reach out first and we will arrange a time.
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-2 pt-2 text-sm text-muted-foreground">
                <span>{contactDetails.hours}</span>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section className="border-t border-border bg-muted/30">
        <Container className="flex flex-col gap-10">
          <SectionHeader eyebrow="FAQ" title="Before you write" />
          <Reveal>
            <FaqAccordion faqs={contactFaqs} />
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
