import type { LegalDocument } from "../content/legal";
import { Reveal } from "./motion";
import { Container, Section } from "./section";

export function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <Section>
      <Container className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <Reveal className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            On this page
          </p>
          <nav className="mt-3 flex flex-col gap-2 border-l border-border pl-4">
            {document.sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </Reveal>

        <Reveal className="max-w-2xl" delay={0.05}>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {document.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: {document.updated}
          </p>
          <p className="mt-6 text-base/relaxed text-muted-foreground">
            {document.intro}
          </p>

          {document.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="mt-10 scroll-mt-24"
            >
              <h2 className="font-heading text-xl font-semibold text-foreground">
                {section.title}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-3 text-sm/relaxed text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
