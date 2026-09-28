import type { RoutePathType } from "@/types";

export interface NavItem {
  label: string;
  href: RoutePathType;
}

export interface SocialLink {
  label: string;
  href: string;
}

export const brand = {
  name: "Dream To Real",
  short: "DTR",
  tagline: "Software that ships. Search that ranks.",
} as const;

export const marketingNav: Array<NavItem> = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
];

export const legalNav: Array<NavItem> = [
  { label: "Privacy & Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
];

export const footerColumns: Array<{
  title: string;
  items: Array<NavItem>;
}> = [
  {
    title: "Company",
    items: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Services",
    items: [{ label: "All Services", href: "/services" }],
  },
  {
    title: "Legal",
    items: legalNav,
  },
];

export const contactDetails = {
  email: "hello@dreamtoreal.dev",
  phone: "+880 1700-000000",
  address: ["Level 4, House 12, Road 5", "Banani, Dhaka 1213, Bangladesh"],
  hours: "Sunday – Thursday, 9:00 – 18:00 (GMT+6)",
} as const;

export const socialLinks: Array<SocialLink> = [
  { label: "LinkedIn", href: "https://www.linkedin.com" },
  { label: "Facebook", href: "https://www.facebook.com" },
];
