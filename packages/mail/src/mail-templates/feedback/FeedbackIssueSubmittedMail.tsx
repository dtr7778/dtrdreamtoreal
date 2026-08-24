import { Section, Text } from "react-email";

import { FeedbackIssueTypeEnumType } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";

import { EmailButton } from "../../shared/EmailButton";
import { EmailLayout } from "../../shared/EmailLayout";
import { EmailLink } from "../../shared/EmailLink";

export interface FeedbackIssueSubmittedMailProps {
  userName: string;
  appName: string;
  supportMail: string;
  issueTitle: string;
  issueType: FeedbackIssueTypeEnumType;
  issueUrl: string;
}

export default function FeedbackIssueSubmittedMail({
  userName,
  appName,
  supportMail,
  issueTitle,
  issueType,
  issueUrl,
}: FeedbackIssueSubmittedMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText={`We received your ${formatEnumValue(issueType)} - ${issueTitle}`}
      supportMail={supportMail}
    >
      <Text>Hello {userName},</Text>

      <Text>
        Thanks for reaching out. We received your{" "}
        <strong>{formatEnumValue(issueType)}</strong>:{" "}
        <strong>{`"${issueTitle}"`}</strong>. Our support team will review it
        and get back to you.
      </Text>

      <Section className="text-center my-4">
        <EmailButton href={issueUrl}>View Issue</EmailButton>
      </Section>

      <Text>
        If the button above doesn&apos;t work, copy and paste this link into
        your browser:
      </Text>

      <EmailLink href={issueUrl}>{issueUrl}</EmailLink>

      <Text className="text-sm text-muted-foreground">
        You will receive an email whenever someone replies to your issue or its
        status changes.
      </Text>
    </EmailLayout>
  );
}

FeedbackIssueSubmittedMail.PreviewProps = {
  userName: "Jane Smith",
  appName: "App Name",
  supportMail: "help@app-name.com",
  issueTitle: "Cannot upload logo",
  issueType: "BUG",
  issueUrl: "http://localhost:3000/dashboard/support/abc123",
} as FeedbackIssueSubmittedMailProps;
