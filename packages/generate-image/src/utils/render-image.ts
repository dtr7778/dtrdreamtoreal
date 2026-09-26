import type { ReactElement } from "react";

import { Resvg } from "@resvg/resvg-wasm";
import satori from "satori";

import type { SatoriFont } from "./fonts";

export interface RenderImageToPngOptions {
  /** Output width in pixels. */
  width: number;
  /** Output height in pixels. */
  height: number;
  /** Fonts available to Satori. At least one is required to render text. */
  fonts: SatoriFont[];
  /** Background color, applied to both the SVG and the rasterized image. */
  background?: string;
}

/**
 * Base renderer: converts any React element into an SVG with Satori, then
 * rasterizes that SVG into a PNG buffer with resvg.
 *
 * Specific images (e.g. the audit report) build their element and call this.
 */
export async function renderImageToPng(
  element: ReactElement,
  options: RenderImageToPngOptions
): Promise<Buffer> {
  const { width, height, fonts, background = "#ffffff" } = options;

  const svg = await satori(element, {
    width,
    height,
    fonts,
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    background,
  });

  return Buffer.from(resvg.render().asPng());
}
