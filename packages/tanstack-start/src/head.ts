import { THEME_COLOR } from "./brand";

export interface SiteHeadOptions {
  appName: string;
  siteUrl: string;
  title: string;
  description: string;
  robots?: string;
  stylesheets?: ReadonlyArray<string>;
  ogImagePath?: string;
  social?: boolean;
}

export interface SiteHeadMatch {
  pathname: string;
}

export interface SiteHeadConfig {
  meta: Array<Record<string, string>>;
  links: Array<Record<string, string>>;
}

const GOOGLEBOT_DEFAULT =
  "index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1";

export function siteHead(options: SiteHeadOptions) {
  const {
    appName,
    siteUrl,
    title,
    description,
    robots = "index, follow",
    stylesheets = [],
    ogImagePath = "/opengraph-image.jpeg",
    social = true,
  } = options;

  const baseUrl = siteUrl.replace(/\/$/, "");

  return ({
    matches,
  }: {
    matches: ReadonlyArray<SiteHeadMatch>;
  }): SiteHeadConfig => {
    const pathname = matches.at(-1)?.pathname ?? "/";
    const canonicalUrl = pathname === "/" ? baseUrl : `${baseUrl}${pathname}`;
    const ogImage = `${baseUrl}${ogImagePath}`;
    const googlebot = robots.includes("noindex") ? robots : GOOGLEBOT_DEFAULT;

    const meta: Array<Record<string, string>> = [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: THEME_COLOR },
      { title },
      { name: "description", content: description },
      { name: "robots", content: robots },
      { name: "googlebot", content: googlebot },
      { name: "format-detection", content: "telephone=no" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: appName },
      {
        name: "apple-mobile-web-app-status-bar-style",
        content: "black-translucent",
      },
    ];

    if (social) {
      meta.push(
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:site_name", content: appName },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: appName },
        { property: "og:locale", content: "en_US" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
        { name: "twitter:image:alt", content: appName }
      );
    }

    const links: Array<Record<string, string>> = [
      ...stylesheets.map((href) => ({ rel: "stylesheet", href })),
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "canonical", href: canonicalUrl },
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon-96x96.png",
        sizes: "96x96",
      },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "shortcut icon", href: "/favicon.ico" },
      {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ];

    return { meta, links };
  };
}
