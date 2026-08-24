import { env } from "@/lib/env";

export function resolveImagePath(url: string) {
  try {
    if (url.startsWith(env.NEXT_PUBLIC_SITE_URL)) {
      const urlObj = new URL(url);
      return urlObj.pathname + urlObj.search;
    }
    return url;
  } catch {
    return url;
  }
}
