export interface OgMetaOptions {
  appName: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
}

export function buildOgMeta(
  options: OgMetaOptions
): Array<Record<string, string>> {
  const { appName, title, description, url, imageUrl } = options;

  return [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:site_name", content: appName },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: imageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: appName },
    { property: "og:locale", content: "en_US" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
    { name: "twitter:image:alt", content: appName },
  ];
}

export function buildFaviconLinks(): Array<Record<string, string>> {
  return [
    { rel: "manifest", href: "/site.webmanifest" },
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
}
