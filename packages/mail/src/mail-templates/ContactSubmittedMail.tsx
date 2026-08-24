import { Section, Text } from "react-email";

import { EmailLayout } from "../shared/EmailLayout";

export interface ContactSubmittedMailProps {
  userName: string;
  appName: string;
  supportMail: string;
}

export default function ContactSubmittedMail({
  userName,
  appName,
  supportMail,
}: ContactSubmittedMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText={`New contact submission from ${appName}`}
      supportMail={supportMail}
    >
      <Text className="text-gray-800 text-base mb-4">Hello {userName},</Text>

      <Section>
        <Text className="text-gray-800 text-base">
          Thanks for contacting us. We&apos;ve received your message and will
          get back to you within 24 hours.
        </Text>
      </Section>
    </EmailLayout>
  );
}

ContactSubmittedMail.PreviewProps = {
  userName: "Jane Smith",
  appName: "App Name",
  supportMail: "help@app-name.com",
} as ContactSubmittedMailProps;
