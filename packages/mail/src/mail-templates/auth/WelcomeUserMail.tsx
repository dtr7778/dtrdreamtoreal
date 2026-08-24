import { Column, Row, Section, Text } from "react-email";

import { EmailButton } from "../../shared/EmailButton";
import {
  EmailHeading,
  EmailInfoCard,
  EmailLayout,
} from "../../shared/EmailLayout";
import { EmailLink } from "../../shared/EmailLink";

export interface WelcomeUserMailProps {
  userName: string;
  appName: string;
  supportMail: string;
  dashboardUrl: string;
}

export default function WelcomeUserMail({
  userName,
  appName,
  supportMail,
  dashboardUrl,
}: WelcomeUserMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText="Welcome! Your account is ready."
      supportMail={supportMail}
    >
      <EmailHeading>👋 Welcome to {appName}!</EmailHeading>

      <Text>Hello {userName},</Text>

      <Text>
        Your account has been successfully created. We&apos;re thrilled to have
        you on board!
      </Text>

      <Text>Here are a few things you can do to get started:</Text>

      <EmailInfoCard>
        <Row className="items-start mb-3">
          <Column className="w-6 text-primary font-bold text-sm">1.</Column>
          <Column>
            <Text className="text-sm font-semibold m-0 text-foreground">
              Complete your profile
            </Text>
            <Text className="text-xs text-muted-foreground m-0">
              Add a profile picture and update your contact details so your team
              and clients recognize you.
            </Text>
          </Column>
        </Row>
        <Row className="items-start mb-3">
          <Column className="w-6 text-primary font-bold text-sm">2.</Column>
          <Column>
            <Text className="text-sm font-semibold m-0 text-foreground">
              Explore your dashboard
            </Text>
            <Text className="text-xs text-muted-foreground m-0">
              Get familiar with your schedule, tasks, and messages all in one
              place.
            </Text>
          </Column>
        </Row>
        <Row className="items-start">
          <Column className="w-6 text-primary font-bold text-sm">3.</Column>
          <Column>
            <Text className="text-sm font-semibold m-0 text-foreground">
              Set your preferences
            </Text>
            <Text className="text-xs text-muted-foreground m-0">
              Configure your notification settings and timezone so you never
              miss an update.
            </Text>
          </Column>
        </Row>
      </EmailInfoCard>

      <Section className="text-center my-6">
        <EmailButton href={dashboardUrl}>Go to Dashboard</EmailButton>
      </Section>

      <Section className="my-6">
        <Text className="text-sm text-muted-foreground">
          If the button above doesn&apos;t work, click the following link:
        </Text>
        <EmailLink href={dashboardUrl}>{dashboardUrl}</EmailLink>
      </Section>

      <Text className="text-sm text-muted-foreground">
        If you have any questions or need help getting set up, our support team
        is always here to help. Just reply to this email or reach out at{" "}
        <EmailLink href={`mailto:${supportMail}`}>{supportMail}</EmailLink>.
      </Text>
    </EmailLayout>
  );
}

WelcomeUserMail.PreviewProps = {
  userName: "Jane Smith",
  appName: "App name",
  supportMail: "help@app-name.com",
  dashboardUrl: "http://localhost:3000/dashboard",
} as WelcomeUserMailProps;
