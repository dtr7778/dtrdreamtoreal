import sanitizeHtml from "sanitize-html";
import type { IOptions } from "sanitize-html";

import type { SanitizedFileKind } from "@workspace/lib/upload";

const SAFE_SCHEMES = ["http", "https", "mailto", "tel"];

const HTML_OPTIONS: IOptions = {
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    "img",
    "html",
    "head",
    "body",
    "title",
    "style",
  ],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    "*": ["class", "id", "lang", "dir", "title"],
  },
  allowedSchemes: SAFE_SCHEMES,
  allowProtocolRelative: false,
  // <style> carries CSS only, which cannot run script. Served files are
  // sandboxed by a CSP, so this is safe to keep for page styling.
  allowVulnerableTags: true,
  nonTextTags: ["script", "noscript", "template", "textarea", "option"],
};

const SVG_TAGS = [
  "svg",
  "g",
  "path",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "rect",
  "text",
  "tspan",
  "textPath",
  "defs",
  "use",
  "symbol",
  "title",
  "desc",
  "linearGradient",
  "radialGradient",
  "stop",
  "clipPath",
  "mask",
  "pattern",
  "marker",
  "style",
  "image",
];

const SVG_PRESENTATION_ATTRIBUTES = [
  "id",
  "class",
  "fill",
  "fill-rule",
  "fill-opacity",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-opacity",
  "opacity",
  "clip-path",
  "clip-rule",
  "mask",
  "stop-color",
  "stop-opacity",
  "font-family",
  "font-size",
  "font-weight",
  "text-anchor",
  "transform",
  "d",
  "points",
  "x",
  "y",
  "x1",
  "x2",
  "y1",
  "y2",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "dx",
  "dy",
  "width",
  "height",
  "offset",
  "xmlns",
  "xmlns:xlink",
  "version",
  "href",
  "xlink:href",
  "viewBox",
  "preserveAspectRatio",
  "gradientUnits",
  "gradientTransform",
  "clipPathUnits",
  "patternUnits",
  "patternTransform",
  "markerWidth",
  "markerHeight",
  "refX",
  "refY",
  "orient",
];

const SVG_OPTIONS: IOptions = {
  allowedTags: SVG_TAGS,
  allowedAttributes: {
    "*": SVG_PRESENTATION_ATTRIBUTES,
  },
  allowedSchemes: SAFE_SCHEMES,
  allowProtocolRelative: false,
  allowVulnerableTags: true,
  nonTextTags: ["script", "foreignObject", "textarea", "option"],
  parser: {
    lowerCaseTags: false,
    lowerCaseAttributeNames: false,
    recognizeSelfClosing: true,
  },
};

export function sanitizeUploadedMarkup(
  content: string,
  kind: SanitizedFileKind
): string {
  return sanitizeHtml(content, kind === "svg" ? SVG_OPTIONS : HTML_OPTIONS);
}
