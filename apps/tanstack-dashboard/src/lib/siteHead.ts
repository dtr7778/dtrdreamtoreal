import { env } from "#/lib/env";

import {
  buildHead,
  SITE_DESCRIPTION,
  THEME_COLOR,
} from "@workspace/tanstack-start";

import appCss from "../styles.css?url";

export const { globalHead, head } = buildHead({
  appName: env.VITE_APP_NAME,
  siteUrl: env.VITE_SITE_URL,
  defaultTitle: `Dashboard | ${env.VITE_APP_NAME}`,
  titleTemplate: `%s | Dashboard | ${env.VITE_APP_NAME}`,
  description: SITE_DESCRIPTION,
  themeColor: THEME_COLOR,
  robots: "noindex, nofollow",
  social: false,
  stylesheets: [appCss],
});
