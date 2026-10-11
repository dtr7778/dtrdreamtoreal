import { brand } from "#/constants/content";
import { env } from "#/lib/env";
import { createFileRoute } from "@tanstack/react-router";

import { SITE_DESCRIPTION } from "@workspace/tanstack-start";

export const Route = createFileRoute("/")({
  head: () => {
    const title = `Software Development & Digital Marketing Agency | ${env.VITE_APP_NAME}`;

    return {
      meta: [
        { title },
        { property: "og:title", content: title },
        { property: "og:description", content: SITE_DESCRIPTION },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: SITE_DESCRIPTION },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: brand.name,
            url: env.VITE_SITE_URL,
            description:
              "Software development and digital marketing studio offering SEO, AIO, AEO and GEO services.",
          }),
        },
      ],
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <></>;
}
