export interface CaseStudy {
  slug: string;
  client: string;
  title: string;
  category: string;
  summary: string;
  metrics: Array<{ value: string; label: string }>;
  tags: Array<string>;
  accent: "primary" | "chart-2" | "chart-3" | "chart-4";
}

export const caseStudies: Array<CaseStudy> = [
  {
    slug: "northwind-retail",
    client: "Northwind Retail",
    title: "A storefront rebuild that doubled organic revenue",
    category: "E-commerce · SEO · Development",
    summary:
      "We replaced a slow legacy storefront with a Next.js build, fixed technical SEO debt and restructured the catalogue around search intent.",
    metrics: [
      { value: "2.1x", label: "Organic sessions" },
      { value: "98", label: "Lighthouse score" },
    ],
    tags: ["Next.js", "SEO", "Core Web Vitals"],
    accent: "primary",
  },
  {
    slug: "ledgerline",
    client: "Ledgerline",
    title: "A fintech dashboard that ships weekly",
    category: "SaaS · Product Design",
    summary:
      "A design system and typed frontend let a two-person product team ship features without breaking what already worked.",
    metrics: [
      { value: "14d", label: "Idea to release" },
      { value: "0", label: "Regression bugs" },
    ],
    tags: ["Design System", "React", "TypeScript"],
    accent: "chart-2",
  },
  {
    slug: "cascade-health",
    client: "Cascade Health",
    title: "Becoming the answer in AI search",
    category: "AIO · AEO · GEO",
    summary:
      "Entity cleanup, schema markup and answer-first content put Cascade in AI Overviews for the queries that mattered.",
    metrics: [
      { value: "3.4x", label: "AI citations" },
      { value: "68%", label: "Answer coverage" },
    ],
    tags: ["AIO", "Structured Data", "Content"],
    accent: "chart-3",
  },
  {
    slug: "bluepeak",
    client: "Bluepeak",
    title: "From audit to a 40% faster experience",
    category: "Performance · Accessibility",
    summary:
      "A full technical audit prioritised the fixes that moved Core Web Vitals and accessibility in a single quarter.",
    metrics: [
      { value: "-41%", label: "LCP" },
      { value: "AA", label: "WCAG level" },
    ],
    tags: ["Audit", "Performance", "a11y"],
    accent: "chart-4",
  },
];

export const techStackGroups: Array<{
  title: string;
  items: Array<string>;
}> = [
  {
    title: "Frontend",
    items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion"],
  },
  {
    title: "Backend & data",
    items: ["Node.js", "PostgreSQL", "Drizzle ORM", "BullMQ", "REST & RPC"],
  },
  {
    title: "Infrastructure",
    items: ["Docker", "Vercel", "Redis", "GitHub Actions", "Supabase"],
  },
];

export const milestones = [
  {
    year: "2020",
    title: "DTR begins",
    description:
      "Started as a two-person web studio building sites for local businesses.",
  },
  {
    year: "2022",
    title: "Product engineering",
    description:
      "Moved into SaaS and platform work, adopting typed, tested architectures.",
  },
  {
    year: "2024",
    title: "Search becomes core",
    description:
      "Added technical SEO and performance auditing as a first-class service.",
  },
  {
    year: "2026",
    title: "AI search ready",
    description:
      "Launched AIO, AEO and GEO services as generative search reshaped discovery.",
  },
];
