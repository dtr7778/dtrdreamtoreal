export function expandTrustedOrigins(origins: string | string[]): string[] {
  const list = Array.isArray(origins) ? origins : [origins];

  const expanded = list.flatMap((origin) => {
    if (origin.includes("*") || origin.includes("?")) return [origin];

    try {
      const url = new URL(origin);
      const rootDomain = url.host.replace(/^www\./, "");
      return [
        url.origin,
        `${url.protocol}//${rootDomain}`,
        `${url.protocol}//www.${rootDomain}`,
      ];
    } catch {
      return [origin];
    }
  });

  return Array.from(new Set(expanded));
}
