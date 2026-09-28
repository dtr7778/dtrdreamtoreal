"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";

import type { Faq } from "../content/home";

export function FaqAccordion({ faqs }: { faqs: Array<Faq> }) {
  return (
    <Accordion className="mx-auto w-full max-w-3xl">
      {faqs.map((faq, index) => (
        <AccordionItem key={faq.question} value={`faq-${index}`}>
          <AccordionTrigger className="p-4 text-sm font-medium sm:text-base">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-sm/relaxed text-muted-foreground">
              {faq.answer}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
