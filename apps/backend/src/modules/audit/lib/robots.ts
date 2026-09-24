export interface RobotsGroup {
  userAgents: string[];
  allow: string[];
  disallow: string[];
}

export interface RobotsData {
  raw: string;
  groups: RobotsGroup[];
  sitemaps: string[];
}

export function parseRobotsTxt(content: string): RobotsData {
  const groups: RobotsGroup[] = [];
  const sitemaps: string[] = [];

  let current: RobotsGroup | null = null;
  let lastLineWasUserAgent = false;

  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.split("#")[0]?.trim() ?? "";
    if (!line) continue;

    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;

    const field = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();

    if (field === "sitemap") {
      if (value) sitemaps.push(value);
      continue;
    }

    if (field === "user-agent" || field === "useragent") {
      if (!current || !lastLineWasUserAgent) {
        current = { userAgents: [], allow: [], disallow: [] };
        groups.push(current);
      }
      current.userAgents.push(value.toLowerCase());
      lastLineWasUserAgent = true;
      continue;
    }

    if (!current) {
      current = { userAgents: [], allow: [], disallow: [] };
      groups.push(current);
    }

    lastLineWasUserAgent = false;

    if (field === "disallow") current.disallow.push(value);
    else if (field === "allow") current.allow.push(value);
  }

  return { raw: content, groups, sitemaps };
}

function matchesAgent(userAgent: string, agent: string): boolean {
  const normalized = agent.toLowerCase();
  if (userAgent === "*") return true;
  return normalized.includes(userAgent);
}

export function getGroupForAgent(
  data: RobotsData,
  agent: string
): RobotsGroup | null {
  let best: RobotsGroup | null = null;
  let bestLength = -1;

  for (const group of data.groups) {
    for (const ua of group.userAgents) {
      if (ua === "*") {
        if (bestLength < 0) {
          best = group;
          bestLength = 0;
        }
        continue;
      }
      if (matchesAgent(ua, agent) && ua.length > bestLength) {
        best = group;
        bestLength = ua.length;
      }
    }
  }

  return best;
}

function patternToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  const anchored = escaped.endsWith("$") ? escaped : `${escaped}`;
  return new RegExp(`^${anchored}`);
}

/**
 * Determine whether a path is allowed for a given user agent using the
 * longest-match rule (Google's robots.txt interpretation).
 */
export function isPathAllowed(
  data: RobotsData,
  path: string,
  agent: string
): boolean {
  const group = getGroupForAgent(data, agent);
  if (!group) return true;

  let bestType: "allow" | "disallow" | null = null;
  let bestLength = -1;

  const evaluate = (rules: string[], type: "allow" | "disallow") => {
    for (const rule of rules) {
      if (rule === "") continue;
      if (patternToRegex(rule).test(path) && rule.length > bestLength) {
        bestLength = rule.length;
        bestType = type;
      }
    }
  };

  evaluate(group.allow, "allow");
  evaluate(group.disallow, "disallow");

  if (bestType === null) return true;
  return bestType === "allow";
}

export function findSitemapDirective(data: RobotsData): string | null {
  return data.sitemaps[0] ?? null;
}
