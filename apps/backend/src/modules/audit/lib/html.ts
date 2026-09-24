export interface ParsedImage {
  src: string | null;
  alt: string | null;
  width: string | null;
  height: string | null;
  loading: string | null;
  srcset: string | null;
  isLazy: boolean;
}

export interface ParsedAnchor {
  href: string | null;
  text: string;
  rel: string | null;
  target: string | null;
}

export interface ParsedHreflang {
  hreflang: string | null;
  href: string | null;
}

const ENTITY_MAP: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

export function decodeHtmlEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
    if (typeof entity !== "string") return match;
    if (entity.startsWith("#x") || entity.startsWith("#X")) {
      const code = Number.parseInt(entity.slice(2), 16);
      return Number.isNaN(code) ? match : String.fromCodePoint(code);
    }
    if (entity.startsWith("#")) {
      const code = Number.parseInt(entity.slice(1), 10);
      return Number.isNaN(code) ? match : String.fromCodePoint(code);
    }
    return ENTITY_MAP[entity.toLowerCase()] ?? match;
  });
}

export function stripComments(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, "");
}

export function parseAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const attrRegex =
    /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>`]+))/g;

  let match: RegExpExecArray | null = attrRegex.exec(tag);
  while (match !== null) {
    const name = match[1];
    const value = match[3] ?? match[4] ?? match[5] ?? "";
    if (name) attributes[name.toLowerCase()] = decodeHtmlEntities(value);
    match = attrRegex.exec(tag);
  }

  return attributes;
}

function matchAll(
  html: string,
  regex: RegExp
): Array<{ full: string; groups: string[] }> {
  const results: Array<{ full: string; groups: string[] }> = [];
  let match: RegExpExecArray | null = regex.exec(html);
  while (match !== null) {
    results.push({ full: match[0], groups: match.slice(1) });
    match = regex.exec(html);
  }
  return results;
}

export function getTitle(html: string): string | null {
  const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  if (!match || !match[1]) return null;
  const title = decodeHtmlEntities(match[1]).replace(/\s+/g, " ").trim();
  return title.length > 0 ? title : null;
}

export function getMetaByName(html: string, name: string): string | null {
  const regex = new RegExp(
    `<meta[^>]*\\bname\\s*=\\s*["']${name}["'][^>]*>`,
    "i"
  );
  const match = regex.exec(html);
  if (!match) return null;
  const attrs = parseAttributes(match[0]);
  return attrs.content ?? null;
}

export function getMetaByProperty(
  html: string,
  property: string
): string | null {
  const regex = new RegExp(
    `<meta[^>]*\\bproperty\\s*=\\s*["']${property}["'][^>]*>`,
    "i"
  );
  const match = regex.exec(html);
  if (!match) return null;
  const attrs = parseAttributes(match[0]);
  return attrs.content ?? null;
}

export function getMetaRobots(html: string): string | null {
  const name = getMetaByName(html, "robots");
  return name;
}

export function getCanonical(html: string): string | null {
  const regex = /<link[^>]*\brel\s*=\s*["']canonical["'][^>]*>/gi;
  const match = regex.exec(html);
  if (!match) return null;
  const attrs = parseAttributes(match[0]);
  return attrs.href ?? null;
}

export function getHtmlLang(html: string): string | null {
  const match = /<html[^>]*>/i.exec(html);
  if (!match) return null;
  const attrs = parseAttributes(match[0]);
  return attrs.lang ?? null;
}

export function getViewport(html: string): string | null {
  return getMetaByName(html, "viewport");
}

export function getHeadings(html: string, level: 1 | 2 | 3): string[] {
  const regex = new RegExp(`<h${level}[^>]*>([\\s\\S]*?)</h${level}>`, "gi");
  return matchAll(html, regex).map((m) =>
    decodeHtmlEntities(m.groups[0] ?? "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

export function getImages(html: string): ParsedImage[] {
  const images: ParsedImage[] = [];
  const regex = /<img\b[^>]*>/gi;
  const matches = matchAll(html, regex);

  for (const match of matches) {
    const attrs = parseAttributes(match.full);
    const loading = attrs.loading ?? null;
    images.push({
      src: attrs.src ?? attrs["data-src"] ?? null,
      alt: attrs.alt ?? null,
      width: attrs.width ?? null,
      height: attrs.height ?? null,
      loading,
      srcset: attrs.srcset ?? null,
      isLazy: loading?.toLowerCase() === "lazy",
    });
  }

  return images;
}

export function getAnchors(html: string): ParsedAnchor[] {
  const anchors: ParsedAnchor[] = [];
  const regex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  const matches = matchAll(html, regex);

  for (const match of matches) {
    const attrs = parseAttributes(match.full);
    anchors.push({
      href: attrs.href ?? null,
      text: decodeHtmlEntities(match.groups[1] ?? "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
      rel: attrs.rel ?? null,
      target: attrs.target ?? null,
    });
  }

  return anchors;
}

export function getHreflangLinks(html: string): ParsedHreflang[] {
  const links: ParsedHreflang[] = [];
  const regex = /<link\b[^>]*\bhreflang\s*=\s*["'][^"']*["'][^>]*>/gi;
  const matches = matchAll(html, regex);

  for (const match of matches) {
    const attrs = parseAttributes(match.full);
    links.push({ hreflang: attrs.hreflang ?? null, href: attrs.href ?? null });
  }

  return links;
}

export function getJsonLdBlocks(html: string): string[] {
  const blocks: string[] = [];
  const regex =
    /<script[^>]*\btype\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const matches = matchAll(html, regex);
  for (const match of matches) {
    const content = match.groups[0]?.trim();
    if (content) blocks.push(content);
  }
  return blocks;
}

export function getScriptSrcs(html: string): string[] {
  const regex = /<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
  return matchAll(html, regex).map((m) => m.groups[0] ?? "");
}

export function getTextContent(html: string): string {
  return decodeHtmlEntities(
    stripComments(html)
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

export function getWordCount(html: string): number {
  const text = getTextContent(html);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

export function findHttpResources(html: string): string[] {
  const found = new Set<string>();
  const regex = /(?:src|href|action|poster)\s*=\s*["'](http:\/\/[^"']+)["']/gi;
  const matches = matchAll(html, regex);
  for (const match of matches) {
    const value = match.groups[0];
    if (value) found.add(value);
  }
  return [...found];
}

export function hasNoindexDirective(html: string): boolean {
  const robots = getMetaRobots(html)?.toLowerCase() ?? "";
  return robots.includes("noindex");
}

export function hasNoindexHeader(headerValue: string | undefined): boolean {
  if (!headerValue) return false;
  return headerValue.toLowerCase().includes("noindex");
}
