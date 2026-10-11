import { env } from "#/lib/env";

export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export const brand = {
  name: env.VITE_APP_NAME,
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
  email: env.VITE_SUPPORT_MAIL,
} as const;

export const socialLinks: Array<SocialLink> = [
  { label: "LinkedIn", href: "https://www.linkedin.com" },
  { label: "Facebook", href: "https://www.facebook.com" },
];
