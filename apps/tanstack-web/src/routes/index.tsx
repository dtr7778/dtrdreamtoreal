import { brand } from "#/constants/content";
import { env } from "#/lib/env";
import { head } from "#/lib/siteHead";
import { createFileRoute } from "@tanstack/react-router";

import { SITE_DESCRIPTION } from "@workspace/tanstack-start";

export const Route = createFileRoute("/")({
  head: ({ match }) => ({
    ...head({
      titleByTemplate: "Software Development & Digital Marketing Agency",
      pathname: match.pathname,
      description: SITE_DESCRIPTION,
    }),
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
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <></>;
}
