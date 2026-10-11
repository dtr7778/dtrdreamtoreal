import { env } from "#/lib/env";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  head: () => {
    const title = `Contact Us | ${env.VITE_APP_NAME}`;
    const description =
      "Contact about web development, software, SEO or AI search projects. We reply within one business day.";

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/contact"!</div>;
}
