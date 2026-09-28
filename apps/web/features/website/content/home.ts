import type { RoutePathType } from "@/types";

import type { ServiceIconKey } from "./services";

export interface Faq {
  question: string;
  answer: string;
}

export const homeHero = {
  eyebrow: "Software · SEO · AI Search",
  title: "Build it real. Rank it everywhere.",
  description:
    "DTR is a software development and digital marketing studio. We ship web products that work, then make sure the right people — and the right AI — can find them.",
  primaryCta: { label: "Start a project", href: "/contact" as RoutePathType },
  secondaryCta: {
    label: "Explore services",
    href: "/services" as RoutePathType,
  },
  highlights: [
    "Web & software development",
    "SEO and technical growth",
    "AIO, AEO and GEO optimization",
  ],
};

export const trustStats = [
  {
    value: "40+",
    label: "Projects delivered",
    hint: "Across commerce, SaaS and services",
    icon: "code" as ServiceIconKey,
  },
  {
    value: "120+",
    label: "Audits completed",
    hint: "Performance, a11y and SEO",
    icon: "gauge" as ServiceIconKey,
  },
  {
    value: "92%",
    label: "Avg. issue resolution",
    hint: "Within the first quarter",
    icon: "sparkles" as ServiceIconKey,
  },
  {
    value: "3.4x",
    label: "Avg. organic growth",
    hint: "Year over year",
    icon: "search" as ServiceIconKey,
  },
];

export const heroProof = {
  rating: "5.0",
  reviews: "32",
  label: "average client rating",
  stats: [
    { value: "40+", label: "projects" },
    { value: "6 yrs", label: "experience" },
    { value: "98%", label: "retention" },
  ],
};

export const whyUs: Array<{
  icon: ServiceIconKey;
  title: string;
  description: string;
}> = [
  {
    icon: "code",
    title: "Engineers, not handoffs",
    description:
      "The people who plan your build are the ones who ship it. No account-manager telephone game.",
  },
  {
    icon: "search",
    title: "Search built in from day one",
    description:
      "Semantic markup, performance budgets and content structure are part of the build, not an afterthought.",
  },
  {
    icon: "sparkles",
    title: "Ready for AI search",
    description:
      "We optimize entities and answers so your brand shows up in AI Overviews and answer engines.",
  },
  {
    icon: "gauge",
    title: "Measured, not guessed",
    description:
      "Every engagement starts with data and ends with a report that shows exactly what moved.",
  },
];

export const processSteps = [
  {
    step: "01",
    title: "Discover",
    description:
      "We audit your current site, goals and competitors, then agree on the smallest valuable scope.",
    duration: "Week 1",
    icon: "search" as ServiceIconKey,
  },
  {
    step: "02",
    title: "Build",
    description:
      "Design and development in short cycles, with previews you can click and feedback you can see.",
    duration: "Weeks 2–6",
    icon: "code" as ServiceIconKey,
  },
  {
    step: "03",
    title: "Optimize",
    description:
      "Performance, accessibility, technical SEO and AI-search structure are tuned before launch.",
    duration: "Final week",
    icon: "gauge" as ServiceIconKey,
  },
  {
    step: "04",
    title: "Scale",
    description:
      "We measure, iterate and grow traffic and conversions through content and experiments.",
    duration: "Ongoing",
    icon: "sparkles" as ServiceIconKey,
  },
];

export const testimonials = [
  {
    quote:
      "DTR rebuilt our marketing site and fixed a decade of technical debt. Organic traffic doubled in four months.",
    name: "Ayesha Rahman",
    role: "Head of Marketing",
    company: "Northwind Retail",
    rating: 5,
  },
  {
    quote:
      "They understood our stack and our SEO problem as one thing. The audit alone paid for the project.",
    name: "Daniel Okafor",
    role: "Founder",
    company: "Ledgerline",
    rating: 5,
  },
  {
    quote:
      "Clear communication, no surprises, and a product that actually shipped on schedule. Rare combination.",
    name: "Mei Lin",
    role: "CTO",
    company: "Cascade Health",
    rating: 5,
  },
];

export const clientLogos = [
  "Northwind",
  "Ledgerline",
  "Cascade",
  "Bluepeak",
  "Vertex Labs",
  "Harbour & Co",
];

export const homeFaqs: Array<Faq> = [
  {
    question: "What kind of companies do you work with?",
    answer:
      "Startups, agencies and established businesses that need a web product and a search strategy that supports it. If you sell or operate online, we can help.",
  },
  {
    question: "Do you do design as well as development?",
    answer:
      "Yes. We handle product and UI/UX design in-house and build a reusable design system, so future pages stay consistent and fast to ship.",
  },
  {
    question: "How is AIO/AEO/GEO different from SEO?",
    answer:
      "Traditional SEO targets ranked links. AIO, AEO and GEO target the answer itself — making your content structured and quotable so AI assistants cite your brand.",
  },
  {
    question: "How quickly can we start?",
    answer:
      "Most projects begin within one to two weeks of a discovery call. We will confirm scope, timeline and the first milestone in writing.",
  },
  {
    question: "Do you offer ongoing support?",
    answer:
      "Yes. Growth retainers cover monthly development capacity, SEO and GEO work, monitoring and reporting, so improvements keep compounding.",
  },
];

export const announcement = {
  text: "Now booking new projects for Q4 2026",
  cta: { label: "Start a project", href: "/contact" as RoutePathType },
};

export const heroMarquee: Array<string> = [
  "Web Development",
  "Technical SEO",
  "AIO",
  "AEO",
  "GEO",
  "Core Web Vitals",
  "Product Design",
  "Next.js",
  "Accessibility",
  "Growth",
];

export const bentoCapabilities: Array<{
  title: string;
  description: string;
  icon: ServiceIconKey;
  span: string;
  tag?: string;
  stat?: { value: string; label: string };
}> = [
  {
    title: "Full-stack product engineering",
    description:
      "From marketing sites to SaaS platforms — designed, built, tested and deployed as one coherent product.",
    icon: "code",
    span: "sm:col-span-2 lg:row-span-2",
    tag: "Core service",
    stat: { value: "40+", label: "products shipped" },
  },
  {
    title: "Technical SEO",
    description:
      "Crawlability, architecture and content structure that rank and convert.",
    icon: "search",
    span: "",
  },
  {
    title: "AI search optimization",
    description:
      "Entity, schema and answer-first work for AI Overviews and answer engines.",
    icon: "sparkles",
    span: "",
  },
  {
    title: "Performance & accessibility audits",
    description:
      "Core Web Vitals, WCAG and best-practice checks with a prioritised fix list.",
    icon: "gauge",
    span: "sm:col-span-2",
  },
  {
    title: "Growth retainers",
    description:
      "A dependable team for continuous shipping, experiments and reporting.",
    icon: "life-buoy",
    span: "",
  },
];

export const faqSupport = {
  title: "Still have questions?",
  description:
    "Book a free 30-minute call. We will look at your site or idea and tell you honestly what we would do first.",
  bullets: [
    "No obligation, no pressure",
    "A reply within one business day",
    "Free written audit summary",
  ],
  cta: { label: "Book a free call", href: "/contact" as RoutePathType },
};

export const processCta = {
  label: "Start with a free audit",
  href: "/contact" as RoutePathType,
};

export const ctaChecklist: Array<string> = [
  "Free 30-minute discovery call",
  "Clear scope, timeline and price",
  "No long-term lock-in",
];
