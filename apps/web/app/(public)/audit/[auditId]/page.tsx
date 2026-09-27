import type { Metadata } from "next";

import { env } from "@/lib/env";
import { getQueryClient } from "@/lib/tanstack/query/hydration";

import { PublicAuditReport } from "@/features/audit/components/public/PublicAuditReport";
import { orpcTQClient } from "@/server/orpc.client";

export const metadata: Metadata = {
  title: "Website Audit Report",
  description:
    "A technical SEO, performance, and quality audit report for your website.",
};

function buildCtaHref(input: {
  email: string;
  name: string;
  url: string;
  score: number;
}) {
  const subject = encodeURIComponent(`Full audit report for ${input.name}`);
  const body = encodeURIComponent(
    `Hi,\n\nI reviewed the audit for ${input.url} (score ${input.score}/100) and I would like the complete report and a fix plan.\n\nThanks.`
  );

  return `mailto:${input.email}?subject=${subject}&body=${body}`;
}

export default async function PublicAuditPage(
  props: PageProps<"/audit/[auditId]">
) {
  const { auditId } = await props.params;

  const queryclient = getQueryClient();

  const { data } = await queryclient.query(
    orpcTQClient.audit.public.details.queryOptions({
      input: {
        id: auditId,
      },
    })
  );

  return (
    <PublicAuditReport
      report={data}
      ctaHref={buildCtaHref({
        email: env.SUPPORT_MAIL,
        name: data.name,
        url: data.url,
        score: data.score,
      })}
    />
  );
}
