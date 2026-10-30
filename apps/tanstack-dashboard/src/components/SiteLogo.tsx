import { SITE_NAME } from "#/constants";
import { Link } from "@tanstack/react-router";

export function SiteLogo() {
  return (
    <Link to="/" className="flex items-center gap-2 self-center font-semibold">
      <div className="flex aspect-square size-8 items-center justify-center">
        <img src="/sitelogo.png" alt={`${SITE_NAME} logo`} />
      </div>
      <span>{SITE_NAME}</span>
    </Link>
  );
}
