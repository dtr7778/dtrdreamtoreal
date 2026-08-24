import { Section, Text } from "react-email";

import {
  FeedbackIssueStatusEnumType,
  FeedbackIssueTypeEnumType,
} from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";

import { EmailButton } from "../../shared/EmailButton";
import { EmailLayout } from "../../shared/EmailLayout";
import { EmailLink } from "../../shared/EmailLink";

export interface FeedbackIssueStatusChangedMailProps {
  userName: string;
  appName: string;
  supportMail: string;
  issueTitle: string;
  issueType: FeedbackIssueTypeEnumType;
  newStatus: FeedbackIssueStatusEnumType;
  issueUrl: string;
}

export default function FeedbackIssueStatusChangedMail({
  userName,
  appName,
  supportMail,
  issueTitle,
  issueType,
  newStatus,
  issueUrl,
}: FeedbackIssueStatusChangedMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText={`Your ${formatEnumValue(issueType)} is now ${formatEnumValue(newStatus)}`}
      supportMail={supportMail}
    >
      <Text>Hello {userName},</Text>

      <Text>
        The status of your {formatEnumValue(issueType)}{" "}
        <strong>{`"${issueTitle}"`}</strong> has been changed to{" "}
        <strong>{formatEnumValue(newStatus)}</strong>.
      </Text>

      <Section className="text-center my-4">
        <EmailButton href={issueUrl}>View Issue</EmailButton>
      </Section>

      <Text>
        If the button above doesn&apos;t work, copy and paste this link into
        your browser:
      </Text>

      <EmailLink href={issueUrl}>{issueUrl}</EmailLink>
    </EmailLayout>
  );
}

FeedbackIssueStatusChangedMail.PreviewProps = {
  userName: "Jane Smith",
  appName: "App Name",
  supportMail: "help@app-name.com",
  issueTitle: "Cannot upload logo",
  issueType: "BUG",
  newStatus: "RESOLVED",
  issueUrl: "http://localhost:3000/dashboard/support/abc123",
} as FeedbackIssueStatusChangedMailProps;
