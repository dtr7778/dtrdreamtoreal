import { Section, Text } from "react-email";

import { EmailLayout } from "../shared/EmailLayout";

export interface ContactReplyMailProps {
  userName: string;
  appName: string;
  supportMail: string;
  subject: string;
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
      previewText={`New reply on your contact: ${subject}`}
      supportMail={supportMail}
    >
      <Text>Hello {userName},</Text>

      <Text>
        <strong>{replyAuthor}</strong> has replied to your contact submission{" "}
        <strong>{`"${subject}"`}</strong>.
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
