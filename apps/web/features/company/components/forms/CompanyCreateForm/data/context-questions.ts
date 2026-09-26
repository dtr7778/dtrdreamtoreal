const yesNoOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const businessModelOptions = [
  { value: "b2b", label: "B2B" },
  { value: "b2c", label: "B2C" },
  { value: "d2c", label: "D2C" },
  { value: "marketplace", label: "Marketplace" },
  { value: "saas", label: "SaaS" },
  { value: "local_service", label: "Local service" },
  { value: "ecommerce", label: "Ecommerce" },
  { value: "other", label: "Other" },
];

const primaryGoalOptions = [
  { value: "traffic", label: "Traffic" },
  { value: "leads", label: "Leads" },
  { value: "sales", label: "Sales" },
  { value: "signups", label: "Signups" },
  { value: "demos", label: "Demos" },
  { value: "calls", label: "Calls" },
  { value: "store_visits", label: "Store visits" },
  { value: "revenue", label: "Revenue" },
];

const reportingFrequencyOptions = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
];

const communicationChannelOptions = [
  { value: "email", label: "Email" },
  { value: "slack", label: "Slack" },
  { value: "teams", label: "Microsoft Teams" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "Phone" },
  { value: "other", label: "Other" },
];

export type ContextFieldType = "text" | "textarea" | "select" | "array";

export type ContextQuestion = {
  name: string;
  label: string;
  type: ContextFieldType;
  placeholder?: string;
  description?: string;
  options?: Array<{ value: string; label: string }>;
};

export type ContextSection = {
  name: string;
  title: string;
  description: string;
  questions: Array<ContextQuestion>;
};

export const contextSections: Array<ContextSection> = [
  {
    name: "businessOverview",
    title: "Business Overview",
    description:
      "High-level facts about what the company does, what it sells, and where it operates. This anchors every downstream decision about positioning, keywords, and content.",
    questions: [
      {
        name: "whatWeDo",
        label: "Company overview",
        type: "textarea",
        placeholder:
          "e.g. We help mid-market logistics teams cut last-mile delivery costs with route-planning software.",
        description:
          "One or two sentences describing what the company does, who it serves, and how it creates value. Plain language, no jargon.",
      },
      {
        name: "productsServices",
        label: "Products & services",
        type: "array",
        placeholder: "e.g. Route planning software",
        description:
          "The core products or services the company sells. Add each one separately and press Enter.",
      },
      {
        name: "priorityGrowth",
        label: "Growth priorities",
        type: "textarea",
        placeholder: "e.g. The new analytics add-on",
        description:
          "Which products or services should grow first. This determines where SEO effort is focused.",
      },
      {
        name: "differentiators",
        label: "Differentiators",
        type: "textarea",
        placeholder: "e.g. Same-day onboarding with no implementation fees",
        description:
          "What genuinely sets the company apart in customers' eyes, such as pricing, speed, expertise, support, or integrations.",
      },
      {
        name: "businessModel",
        label: "Business model",
        type: "select",
        options: businessModelOptions,
        placeholder: "Select business model",
        description:
          "How the company sells and who pays. Choose the closest match.",
      },
      {
        name: "yearsOperating",
        label: "Years operating",
        type: "text",
        placeholder: "e.g. 5 years",
        description:
          "How long the business has been trading. Useful for trust signals and assessing maturity.",
      },
      {
        name: "marketsServed",
        label: "Markets served",
        type: "array",
        placeholder: "e.g. United Kingdom",
        description:
          "Countries, cities, or regions the company serves. Add each market separately.",
      },
    ],
  },
  {
    name: "customersSearchBehavior",
    title: "Customers & Search Behavior",
    description:
      "How customers think, search, and decide. This drives keyword themes, content angles, and objection handling.",
    questions: [
      {
        name: "customerTypes",
        label: "Customer types",
        type: "array",
        placeholder: "e.g. Operations managers",
        description:
          "The main groups of people or businesses that buy from the company.",
      },
      {
        name: "idealCustomer",
        label: "Ideal customer",
        type: "textarea",
        placeholder: "e.g. 50–500 person logistics firms in the UK",
        description:
          "The best-fit customer by size, industry, budget, or role. The more specific, the better.",
      },
      {
        name: "customerProblems",
        label: "Customer problems",
        type: "textarea",
        placeholder: "e.g. Manual route planning wastes hours each week",
        description:
          "The pain points that make customers start searching for a solution.",
      },
      {
        name: "customerTerminology",
        label: "Customer terminology",
        type: "array",
        placeholder: "e.g. last-mile",
        description:
          "Words and phrases customers actually use for the product or problem, including industry slang.",
      },
      {
        name: "buyingQuestions",
        label: "Buying questions",
        type: "textarea",
        placeholder: "e.g. How long does setup take?",
        description:
          "Questions prospects ask before they commit. These often become FAQs and content topics.",
      },
      {
        name: "purchaseObjections",
        label: "Purchase objections",
        type: "textarea",
        placeholder: "e.g. Too expensive for our fleet size",
        description:
          "Reasons prospects hesitate or walk away: price, trust, timing, complexity, or competitors.",
      },
      {
        name: "alternativesCompared",
        label: "Alternatives considered",
        type: "array",
        placeholder: "e.g. Spreadsheets",
        description:
          "What customers compare the company against: competitors, in-house tools, spreadsheets, or doing nothing.",
      },
    ],
  },
  {
    name: "goalsSuccess",
    title: "Goals & Success",
    description:
      "What the engagement must achieve and how success will be judged. Keeps priorities, targets, and reporting aligned.",
    questions: [
      {
        name: "whySeoNow",
        label: "Why now",
        type: "textarea",
        placeholder: "e.g. Paid ads costs are rising every quarter",
        description:
          "The trigger or business reason behind investing in SEO at this point.",
      },
      {
        name: "successDefinition",
        label: "Definition of success",
        type: "textarea",
        placeholder: "e.g. 30 qualified demos a month from organic search",
        description:
          "What a successful outcome looks like in the company's own words.",
      },
      {
        name: "primaryGoal",
        label: "Primary goal",
        type: "select",
        options: primaryGoalOptions,
        placeholder: "Select primary goal",
        description:
          "The single most important outcome SEO should drive for the business.",
      },
      {
        name: "targetMetrics",
        label: "Target metrics",
        type: "textarea",
        placeholder: "e.g. 2,000 organic sessions and 40 leads per month",
        description:
          "Concrete numeric targets and the period they cover, if these are known.",
      },
      {
        name: "goalTimeframe",
        label: "Timeframe",
        type: "text",
        placeholder: "e.g. 6 months",
        description:
          "The period the company is working toward for these outcomes.",
      },
      {
        name: "failureDefinition",
        label: "Failure signals",
        type: "textarea",
        placeholder: "e.g. No visible progress after six months",
        description:
          "What would make the company consider the project unsuccessful.",
      },
    ],
  },
  {
    name: "marketCompetition",
    title: "Market & Competition",
    description:
      "Who the company competes with and where the market opportunity lies. Informs positioning, benchmarking, and content gaps.",
    questions: [
      {
        name: "mainCompetitors",
        label: "Main competitors",
        type: "array",
        placeholder: "e.g. Acme Logistics",
        description:
          "Direct competitors the company loses deals to or is benchmarked against.",
      },
      {
        name: "googleCompetitors",
        label: "Google competitors",
        type: "array",
        placeholder: "e.g. competitor.com",
        description:
          "Sites that consistently outrank the company for important searches.",
      },
      {
        name: "strategicMarkets",
        label: "Strategic markets",
        type: "array",
        placeholder: "e.g. Germany",
        description:
          "Markets or locations with the highest strategic value for growth.",
      },
      {
        name: "competitorChannels",
        label: "Competitor channels",
        type: "textarea",
        placeholder: "e.g. Strong local SEO and review presence",
        description:
          "Channels where competitors are winning customers: content, local search, marketplaces, paid, or social.",
      },
    ],
  },
  {
    name: "existingSeoMarketing",
    title: "Existing SEO & Marketing",
    description:
      "History and current marketing activity. Reveals what has worked, what broke, and what should not be repeated.",
    questions: [
      {
        name: "seoDoneBefore",
        label: "Prior SEO",
        type: "select",
        options: yesNoOptions,
        placeholder: "Select an option",
        description:
          "Whether any SEO work has been done on the website before.",
      },
      {
        name: "previousSeoOwner",
        label: "Previous owner",
        type: "text",
        placeholder: "e.g. Freelancer or in-house team",
        description: "Who handled SEO previously, if anyone.",
      },
      {
        name: "seoWorkCompleted",
        label: "Work completed",
        type: "textarea",
        placeholder: "e.g. Technical fixes and 20 blog posts",
        description:
          "SEO activities already delivered: audits, content, links, or technical fixes.",
      },
      {
        name: "trafficRankingDrop",
        label: "Traffic drop",
        type: "select",
        options: yesNoOptions,
        placeholder: "Select an option",
        description:
          "Whether the site has seen a significant fall in traffic or rankings, and roughly when.",
      },
      {
        name: "migrationHistory",
        label: "Site changes",
        type: "textarea",
        placeholder: "e.g. Rebrand and CMS move in 2024",
        description:
          "Any migrations, redesigns, rebrands, or CMS changes, with dates if known.",
      },
      {
        name: "paidCampaigns",
        label: "Paid campaigns",
        type: "select",
        options: yesNoOptions,
        placeholder: "Select an option",
        description:
          "Whether Google Ads or other paid campaigns are currently running.",
      },
      {
        name: "topMarketingChannels",
        label: "Top channels",
        type: "array",
        placeholder: "e.g. Referrals",
        description:
          "Marketing channels that bring in the most customers today.",
      },
    ],
  },
  {
    name: "websiteTechnical",
    title: "Website & Technical",
    description:
      "Technical setup, access, and constraints. Determines how quickly changes can be implemented.",
    questions: [
      {
        name: "cmsStack",
        label: "CMS / stack",
        type: "text",
        placeholder: "e.g. WordPress, Next.js",
        description: "The platform and technology the website runs on.",
      },
      {
        name: "devManager",
        label: "Development owner",
        type: "text",
        placeholder: "e.g. In-house developer or agency",
        description: "Who is responsible for website development.",
      },
      {
        name: "cmsAccess",
        label: "CMS access",
        type: "select",
        options: yesNoOptions,
        placeholder: "Select an option",
        description:
          "Whether the team can be given CMS/admin access to make content changes.",
      },
      {
        name: "analyticsAccess",
        label: "Analytics access",
        type: "select",
        options: yesNoOptions,
        placeholder: "Select an option",
        description:
          "Whether Google Search Console and Analytics access can be provided.",
      },
      {
        name: "environments",
        label: "Environments",
        type: "select",
        options: yesNoOptions,
        placeholder: "Select an option",
        description:
          "Whether separate staging and production environments exist.",
      },
      {
        name: "technicalRestrictions",
        label: "Technical constraints",
        type: "textarea",
        placeholder: "e.g. Legal review required for every page",
        description:
          "Restrictions, approval steps, or platform limits that affect delivery.",
      },
      {
        name: "upcomingChanges",
        label: "Upcoming changes",
        type: "textarea",
        placeholder: "e.g. New site launch in Q3",
        description:
          "Planned redesigns, migrations, launches, or platform changes that could affect SEO.",
      },
    ],
  },
  {
    name: "contentExpertise",
    title: "Content & Expertise",
    description:
      "Who can create and approve content, and what unique material the company owns. Shapes content quality and authority.",
    questions: [
      {
        name: "contentCreator",
        label: "Content owner",
        type: "text",
        placeholder: "e.g. Marketing team",
        description: "Who currently writes and publishes website content.",
      },
      {
        name: "internalExperts",
        label: "Internal experts",
        type: "textarea",
        placeholder: "e.g. Head of Operations can review posts",
        description:
          "In-house specialists who can contribute or review subject-matter content.",
      },
      {
        name: "proprietaryContent",
        label: "Proprietary material",
        type: "textarea",
        placeholder: "e.g. Benchmark reports and customer data",
        description:
          "Original research, case studies, data, or documentation that can be turned into content.",
      },
      {
        name: "valuablePages",
        label: "Valuable pages",
        type: "array",
        placeholder: "e.g. /pricing",
        description:
          "Existing pages or content that matter most to the business.",
      },
      {
        name: "contentRestrictions",
        label: "Content restrictions",
        type: "textarea",
        placeholder: "e.g. Avoid direct competitor comparisons",
        description: "Topics or claims the company does not want published.",
      },
      {
        name: "complianceRequirements",
        label: "Compliance needs",
        type: "textarea",
        placeholder: "e.g. Financial disclaimers required",
        description:
          "Legal, compliance, brand, or editorial rules content must follow.",
      },
    ],
  },
  {
    name: "conversionRevenue",
    title: "Conversion & Revenue",
    description:
      "What happens after a visit and what a customer is worth. Connects SEO effort to real business results.",
    questions: [
      {
        name: "primaryConversion",
        label: "Primary conversion",
        type: "text",
        placeholder: "e.g. Book a demo",
        description: "The main action the website should drive.",
      },
      {
        name: "postLandingFlow",
        label: "Post-visit flow",
        type: "textarea",
        placeholder: "e.g. Form to sales call to proposal",
        description:
          "What happens after someone lands on the site, step by step.",
      },
      {
        name: "avgCustomerValue",
        label: "Customer value",
        type: "text",
        placeholder: "e.g. £8,000 in the first year",
        description: "The average value of a lead or customer, if known.",
      },
      {
        name: "topConvertingPages",
        label: "Top converting pages",
        type: "array",
        placeholder: "e.g. /demo",
        description: "Pages that currently generate the most leads or sales.",
      },
      {
        name: "conversionTracking",
        label: "Conversion tracking",
        type: "select",
        options: yesNoOptions,
        placeholder: "Select an option",
        description:
          "Whether organic conversions are tracked accurately today.",
      },
      {
        name: "conversionProblems",
        label: "Conversion issues",
        type: "textarea",
        placeholder: "e.g. High form abandonment",
        description: "Known problems that reduce conversion rates.",
      },
    ],
  },
  {
    name: "localSeo",
    title: "Local SEO",
    description:
      "Location-based presence. Complete this only if the business serves customers at physical locations or within defined areas.",
    questions: [
      {
        name: "physicalLocations",
        label: "Locations",
        type: "array",
        placeholder: "e.g. Manchester",
        description: "Physical locations the company operates from or serves.",
      },
      {
        name: "gbpPerLocation",
        label: "Google Business Profiles",
        type: "select",
        options: yesNoOptions,
        placeholder: "Select an option",
        description:
          "Whether each eligible location has a verified Google Business Profile.",
      },
      {
        name: "serviceAreaRestrictions",
        label: "Service areas",
        type: "textarea",
        placeholder: "e.g. Within 50 miles of Manchester",
        description: "Any limits on where the company can serve customers.",
      },
      {
        name: "reviewsImportant",
        label: "Reviews",
        type: "select",
        options: yesNoOptions,
        placeholder: "Select an option",
        description:
          "Whether reviews meaningfully influence customer acquisition.",
      },
    ],
  },
  {
    name: "aiAnswerEngine",
    title: "AI / Answer Engine Discovery",
    description:
      "How the company appears in AI and answer engines. Covers visibility beyond traditional search results.",
    questions: [
      {
        name: "aiDiscovery",
        label: "AI discovery",
        type: "select",
        options: yesNoOptions,
        placeholder: "Select an option",
        description:
          "Whether customers already find or research the company through AI tools.",
      },
      {
        name: "aiPlatforms",
        label: "AI platforms",
        type: "array",
        placeholder: "e.g. ChatGPT",
        description: "AI/search platforms most relevant to the audience.",
      },
      {
        name: "aiQuestions",
        label: "AI questions",
        type: "textarea",
        placeholder: "e.g. Best route planning tools for fleets",
        description:
          "Questions the company wants AI systems to answer accurately about it.",
      },
      {
        name: "brandAssociations",
        label: "Brand associations",
        type: "array",
        placeholder: "e.g. Route optimization",
        description:
          "Products, services, people, or expertise the brand should be linked to.",
      },
      {
        name: "outdatedOnlineInfo",
        label: "Outdated info",
        type: "textarea",
        placeholder: "e.g. Old pricing listed on a directory",
        description:
          "Incorrect or outdated descriptions of the company found online.",
      },
      {
        name: "authoritativeSources",
        label: "Authoritative sources",
        type: "textarea",
        placeholder: "e.g. Industry association directory",
        description:
          "Third-party publications or sources that should accurately describe the company.",
      },
    ],
  },
  {
    name: "resourcesBudgetProcess",
    title: "Resources, Budget & Process",
    description:
      "People, budget, and ways of working. Sets expectations for delivery, approvals, and communication.",
    questions: [
      {
        name: "seoDecisionMaker",
        label: "Decision maker",
        type: "text",
        placeholder: "e.g. Marketing Director",
        description: "The person who ultimately decides on SEO priorities.",
      },
      {
        name: "approvers",
        label: "Approvers",
        type: "text",
        placeholder: "e.g. Brand and Legal",
        description: "Who must approve content and technical changes.",
      },
      {
        name: "internalResources",
        label: "Internal resources",
        type: "textarea",
        placeholder: "e.g. Two writers and one developer",
        description:
          "In-house people or capacity that can support the project.",
      },
      {
        name: "budget",
        label: "Budget",
        type: "text",
        placeholder: "e.g. £3,000 per month",
        description: "Expected monthly or project budget, if one has been set.",
      },
      {
        name: "reportingFrequency",
        label: "Reporting cadence",
        type: "select",
        options: reportingFrequencyOptions,
        placeholder: "Select frequency",
        description: "How often progress should be reported.",
      },
      {
        name: "communicationChannel",
        label: "Communication channel",
        type: "select",
        options: communicationChannelOptions,
        placeholder: "Select a channel",
        description: "The preferred channel for day-to-day communication.",
      },
      {
        name: "deadlinesSeasonality",
        label: "Deadlines & seasonality",
        type: "textarea",
        placeholder: "e.g. Peak season from November to December",
        description:
          "Deadlines, campaigns, launches, or seasonal periods that affect priorities.",
      },
    ],
  },
];
