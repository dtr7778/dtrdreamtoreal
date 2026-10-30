import { SITE_DESCRIPTION, SITE_NAME } from "#/constants";
import { env } from "#/lib/env";

import { buildHead, THEME_COLOR } from "@workspace/tanstack-start";

import appCss from "../styles.css?url";

export const { globalHead, head } = buildHead({
  appName: SITE_NAME,
  siteUrl: env.VITE_SITE_URL,
  defaultTitle: `Dashboard | ${SITE_NAME}`,
  titleTemplate: `%s | Dashboard | ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
  themeColor: THEME_COLOR,
  robots: "noindex, nofollow",
  social: false,
  stylesheets: [appCss],
});
