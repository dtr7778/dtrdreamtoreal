import type { Faq } from "./home";

export const contactHero = {
  eyebrow: "Contact us",
  title: "Tell us what you are trying to build.",
  description:
    "Send a few details and we will reply within one business day with next steps, a rough timeline and whether we are the right fit.",
};

export const contactMethods = [
  {
    key: "email",
    label: "Email",
    value: "hello@dreamtoreal.dev",
    hint: "Best for project briefs and proposals",
    href: "mailto:hello@dreamtoreal.dev",
  },
  {
    key: "phone",
    label: "Phone",
    value: "+880 1700-000000",
    hint: "Sunday – Thursday, 9:00 – 18:00 (GMT+6)",
    href: "tel:+8801700000000",
  },
  {
    key: "office",
    label: "Office",
    value: "Banani, Dhaka 1213, Bangladesh",
    hint: "Visits by appointment",
    href: null,
  },
];

export const contactHours = {
  title: "Working hours",
  rows: [
    { day: "Sunday – Thursday", time: "9:00 – 18:00" },
    { day: "Friday", time: "Closed" },
    { day: "Saturday", time: "10:00 – 14:00" },
  ],
};

export const contactFaqs: Array<Faq> = [
  {
    question: "What happens after I send a message?",
    answer:
      "We read every enquiry personally and reply within one business day. If it looks like a fit, we will suggest a short discovery call.",
  },
  {
    question: "What should I include in my brief?",
    answer:
      "Your goal, your current site or product if you have one, your rough timeline and budget range. The more context, the more useful our first reply.",
  },
  {
    question: "Do you work with international clients?",
    answer:
      "Yes. We work remotely with clients across time zones and schedule calls at hours that suit you.",
  },
];

export const contactAssurances: Array<{
  title: string;
  description: string;
}> = [
  {
    title: "Reply within 1 business day",
    description: "A real person reads and answers every enquiry.",
  },
  {
    title: "NDA on request",
    description: "Happy to sign before you share anything sensitive.",
  },
  {
    title: "No sales pressure",
    description:
      "If we are not the right fit, we will say so and point you on.",
  },
];
