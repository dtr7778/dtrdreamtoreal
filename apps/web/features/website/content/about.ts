import type { ServiceIconKey } from "./services";

export const aboutHero = {
  eyebrow: "About us",
  title: "We turn ambitious ideas into working software.",
  description:
    "Dream To Real is a software development and digital marketing studio. The name is the mission: take a rough idea, a stalled roadmap or a site nobody can find, and make it real.",
};

export const aboutMission = {
  title: "Our mission",
  body: [
    "We believe great software and great search are the same discipline viewed from two angles. Build something fast, accessible and well-structured, and search engines — human or artificial — will reward it.",
    "So we do both. We design and ship web products, and we make them discoverable. No handoffs between a dev shop and an SEO agency, no blame when the two disagree.",
  ],
};

export const aboutStory = {
  title: "The story behind the name",
  body: [
    "DTR started with a simple frustration: businesses were paying twice — once to build a product, and again to fix the marketing that was bolted on afterwards.",
    "We set out to close that gap. Every project begins with the question of how it will be found, and ends with proof that it was. That is what Dream To Real means.",
  ],
};

export const aboutValues: Array<{
  icon: ServiceIconKey;
  title: string;
  description: string;
}> = [
  {
    icon: "code",
    title: "Craft over shortcuts",
    description:
      "Typed, tested, documented code that the next engineer can actually maintain.",
  },
  {
    icon: "search",
    title: "Evidence over opinion",
    description:
      "We measure before we recommend, and report what changed after we ship.",
  },
  {
    icon: "sparkles",
    title: "Curiosity about what's next",
    description:
      "From Core Web Vitals to generative search, we stay ahead so you do not have to.",
  },
  {
    icon: "life-buoy",
    title: "Partners, not vendors",
    description:
      "Clear communication, honest timelines, and support that continues after launch.",
  },
];

export const aboutStats = [
  { value: "40+", label: "Projects delivered" },
  { value: "8", label: "Specialists on the team" },
  { value: "6", label: "Years building for the web" },
  { value: "98%", label: "Client retention" },
];

export const aboutTeam = [
  {
    name: "Saiful Islam",
    role: "Founder & Lead Engineer",
    focus: "Product architecture, Next.js, platform builds",
    location: "Dhaka",
  },
  {
    name: "Nadia Karim",
    role: "Head of Growth",
    focus: "SEO strategy, content architecture, analytics",
    location: "Dhaka",
  },
  {
    name: "Tanvir Ahmed",
    role: "Design Lead",
    focus: "UI/UX, design systems, accessibility",
    location: "Remote",
  },
  {
    name: "Priya Das",
    role: "AI Search Specialist",
    focus: "AIO/AEO/GEO, structured data, LLM visibility",
    location: "Kolkata",
  },
];
