import { Section, Text } from "react-email";

import { FeedbackIssueTypeEnumType } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";

import { EmailButton } from "../../shared/EmailButton";
import { EmailLayout } from "../../shared/EmailLayout";
import { EmailLink } from "../../shared/EmailLink";

export interface FeedbackIssueRepliedMailProps {
  userName: string;
  appName: string;
  supportMail: string;
  issueTitle: string;
  issueType: FeedbackIssueTypeEnumType;
  replyAuthor: string;
  replyContent: string;
  issueUrl: string;
}

export default function FeedbackIssueRepliedMail({
  userName,
  appName,
  supportMail,
  issueTitle,
  issueType,
  replyAuthor,
  replyContent,
  issueUrl,
}: FeedbackIssueRepliedMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText={`New reply on your ${formatEnumValue(issueType)} - ${issueTitle}`}
      supportMail={supportMail}
    >
      <Text>Hello {userName},</Text>

      <Text>
        <strong>{replyAuthor}</strong> replied to your{" "}
        {formatEnumValue(issueType)} <strong>{`"${issueTitle}"`}</strong>.
      </Text>

      <Section className="bg-muted rounded-lg p-4">
        <Text className="text-sm m-0">{replyContent}</Text>
      </Section>

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

FeedbackIssueRepliedMail.PreviewProps = {
  userName: "Jane Smith",
  appName: "App Name",
  supportMail: "help@app-name.com",
  issueTitle: "Cannot upload logo",
  issueType: "BUG",
  replyAuthor: "Support Team",
  replyContent: "Thanks for reporting! We've fixed this in the latest release.",
  issueUrl: "http://localhost:3000/dashboard/support/abc123",
} as FeedbackIssueRepliedMailProps;
