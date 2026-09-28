export type ServiceIconKey =
  "code" | "search" | "sparkles" | "gauge" | "life-buoy";

export interface Service {
  slug: string;
  icon: ServiceIconKey;
  title: string;
  tagline: string;
  description: string;
  deliverables: Array<string>;
}

export const services: Array<Service> = [
  {
    slug: "web-software-development",
    icon: "code",
    title: "Web & Software Development",
    tagline: "From idea to production",
    description:
      "We design and build fast, accessible web products — marketing sites, SaaS platforms, dashboards, and internal tools. Typed end to end, tested, and deployed with confidence.",
    deliverables: [
      "Product strategy and scoping",
      "UI/UX design systems",
      "Next.js, React, Node and Postgres builds",
      "API design and integrations",
      "CI/CD, monitoring and handover docs",
    ],
  },
  {
    slug: "seo",
    icon: "search",
    title: "Search Engine Optimization",
    tagline: "Rank for what matters",
    description:
      "Technical SEO, content architecture, and authority building that compounds. We fix what blocks crawling and indexing, then grow the pages that convert.",
    deliverables: [
      "Technical SEO audit and fixes",
      "Keyword and intent mapping",
      "On-page and internal linking",
      "Content briefs and publishing support",
      "Rank, traffic and conversion reporting",
    ],
  },
  {
    slug: "aio-aeo-geo",
    icon: "sparkles",
    title: "AIO, AEO & GEO",
    tagline: "Be the answer, not a result",
    description:
      "Optimize for AI Overviews, answer engines and generative search. We structure entities, answer questions directly, and make your brand quotable by LLMs.",
    deliverables: [
      "Entity and knowledge-graph alignment",
      "Structured data and schema markup",
      "Answer-first content formatting",
      "LLM citation and mention tracking",
      "AI-visibility reporting",
    ],
  },
  {
    slug: "audit-performance",
    icon: "gauge",
    title: "Audit & Performance",
    tagline: "Measure, then move",
    description:
      "Automated audits across performance, accessibility, Core Web Vitals and best practices — with a prioritised plan of exactly what to fix next.",
    deliverables: [
      "Core Web Vitals and load analysis",
      "Accessibility and best-practice checks",
      "Prioritised remediation roadmap",
      "Before/after benchmark reports",
      "Ongoing performance monitoring",
    ],
  },
  {
    slug: "growth-support",
    icon: "life-buoy",
    title: "Growth & Support",
    tagline: "A team on call",
    description:
      "Retainers for teams that need continuous shipping, experiments and maintenance — a dependable partner instead of a one-off project.",
    deliverables: [
      "Monthly development capacity",
      "Conversion and A/B experiments",
      "Analytics and funnel instrumentation",
      "Proactive maintenance and uptime",
      "Quarterly strategy reviews",
    ],
  },
];

export const engagementTiers = [
  {
    name: "Project",
    price: "From $3,000",
    description: "A defined build with a clear scope and timeline.",
    features: [
      "Discovery and fixed scope",
      "Design and development",
      "Launch and handover",
      "30 days post-launch support",
    ],
    highlighted: false,
  },
  {
    name: "Growth Retainer",
    price: "From $1,500 / month",
    description: "Continuous development plus SEO and AI-search work.",
    features: [
      "Dedicated monthly capacity",
      "SEO and GEO program",
      "Performance monitoring",
      "Monthly reporting and strategy",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Multi-team delivery, integrations and compliance needs.",
    features: [
      "Solution architecture",
      "Security and compliance review",
      "Dedicated squad",
      "SLA-backed support",
    ],
    highlighted: false,
  },
];

export const searchChannels: Array<{
  name: string;
  icon: ServiceIconKey;
  description: string;
  points: Array<string>;
}> = [
  {
    name: "Traditional SEO",
    icon: "search",
    description:
      "Win the ranked list. We fix crawlability, structure content around intent and build authority.",
    points: [
      "Keyword and intent mapping",
      "Technical fixes and site architecture",
      "On-page and internal linking",
      "Backlinks and digital PR",
    ],
  },
  {
    name: "AI Search — AIO / AEO / GEO",
    icon: "sparkles",
    description:
      "Win the answer. We make your content structured and quotable so AI assistants cite your brand.",
    points: [
      "Entity and knowledge-graph alignment",
      "Schema and structured data",
      "Answer-first content formatting",
      "LLM citation and mention tracking",
    ],
  },
];

export const assurances: Array<{
  icon: ServiceIconKey;
  title: string;
  description: string;
}> = [
  {
    icon: "gauge",
    title: "Performance guaranteed",
    description:
      "Every build ships with a performance budget and a Core Web Vitals report.",
  },
  {
    icon: "code",
    title: "You own the code",
    description:
      "Source, infrastructure and documentation transfer to you on completion.",
  },
  {
    icon: "life-buoy",
    title: "Post-launch support",
    description:
      "30 days of included support on every project, with retainers available.",
  },
  {
    icon: "search",
    title: "Measurable outcomes",
    description:
      "We agree the metrics up front and report against them every month.",
  },
];

export const addOns: Array<{
  title: string;
  description: string;
  price: string;
}> = [
  {
    title: "Content production",
    description:
      "Keyword-led articles and landing page copy, ready to publish.",
    price: "From $100 / page",
  },
  {
    title: "Conversion optimization",
    description: "Analytics setup, funnel review and A/B experiment program.",
    price: "From $800 / month",
  },
  {
    title: "Design system",
    description: "Reusable components and tokens your team can build with.",
    price: "From $2,000",
  },
  {
    title: "Analytics & dashboards",
    description: "Traffic, rank and AI-citation reporting in one place.",
    price: "From $1,200",
  },
];
