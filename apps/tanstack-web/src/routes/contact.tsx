import { head } from "#/lib/siteHead";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  head: ({ match }) =>
    head({
      titleByTemplate: "Contact Us",
      pathname: match.pathname,
      description:
        "Contact about web development, software, SEO or AI search projects. We reply within one business day.",
    }),
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/contact"!</div>;
}
