/** @jsxRuntime automatic */
import { Section, Text } from "react-email";

import { EmailLayout } from "../../components/EmailLayout";

export interface ContactReplyMailProps {
  userName?: string | null | undefined;
  appName: string;
  supportMail: string;
  subject?: string | null | undefined;
  replyAuthor: string;
  replyContent: string;
}

export default function ContactReplyMail({
  userName,
  appName,
  supportMail,
  subject,
  replyAuthor,
  replyContent,
}: ContactReplyMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText={
        subject
          ? `New reply on your contact: ${subject}`
          : "New reply on your contact"
      }
      supportMail={supportMail}
    >
      <Text>{userName ? `Hello ${userName},` : "Hello"}</Text>

      <Text>
        <strong>{replyAuthor}</strong> has replied to your contact submission{" "}
        {subject && <strong>{`"${subject}"`}</strong>}
      </Text>

      <Section className="bg-muted rounded-lg p-4">
        <Text className="text-sm m-0">{replyContent}</Text>
      </Section>
    </EmailLayout>
  );
}

ContactReplyMail.PreviewProps = {
  userName: "Jane Smith",
  appName: "App Name",
  supportMail: "help@app-name.com",
  subject: "Inquiry about services",
  replyAuthor: "Support Team",
  replyContent: "Thanks for reaching out! We'll get back to you shortly.",
} as ContactReplyMailProps;
