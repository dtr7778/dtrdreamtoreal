import { createElement } from "react";

import {
  AuditReportCard,
  type AuditReportImageData,
} from "../components/audit-report-card";
import { getAuditReportFonts } from "../utils/fonts";
import { renderImageToPng } from "../utils/render-image";

// 4:3 aspect ratio (1200 x 900)
export const AUDIT_REPORT_WIDTH = 1200;
export const AUDIT_REPORT_HEIGHT = 900;

/**
 * Renders the audit report card to a PNG image using the base renderer.
 */
export async function generateAuditReportImage(
  data: AuditReportImageData
): Promise<Buffer> {
  const element = createElement(AuditReportCard, { data });

  return renderImageToPng(element, {
    width: AUDIT_REPORT_WIDTH,
    height: AUDIT_REPORT_HEIGHT,
    fonts: getAuditReportFonts(),
  });
}
