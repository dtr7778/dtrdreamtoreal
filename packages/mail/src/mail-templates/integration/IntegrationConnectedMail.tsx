import { Column, Row, Section, Text } from "react-email";

import { EmailButton } from "../../shared/EmailButton";
import {
  EmailHeading,
  EmailInfoCard,
  EmailLayout,
} from "../../shared/EmailLayout";
import { EmailLink } from "../../shared/EmailLink";

export interface IntegrationConnectedMailProps {
  adminName: string;
  appName: string;
  supportMail: string;
  integrationName: string;
  connectedAt: string;
  dataSynced: string;
  syncFrequency: string;
  configureUrl: string;
}

export default function IntegrationConnectedMail({
  adminName,
  appName,
  supportMail,
  integrationName,
  connectedAt,
  dataSynced,
  syncFrequency,
  configureUrl,
}: IntegrationConnectedMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText={`${integrationName} successfully connected`}
      supportMail={supportMail}
    >
      <EmailHeading>✅ Integration Connected</EmailHeading>
      <Text>Hello {adminName},</Text>
      <Text>
        Your <span className="font-bold">{integrationName}</span> integration
        has been successfully connected to {appName}. Your data is now syncing
        automatically.
      </Text>

      <EmailInfoCard>
        <Row className="mb-2">
          <Column className="text-xs text-muted-foreground">
            Connected On
          </Column>
          <Column className="text-xs font-bold text-right text-foreground">
            {connectedAt}
          </Column>
        </Row>
        <Row className="mb-2">
          <Column className="text-xs text-muted-foreground">Syncing</Column>
          <Column className="text-xs font-bold text-right text-foreground">
            {dataSynced}
          </Column>
        </Row>
        <Row>
          <Column className="text-xs text-muted-foreground">
            Sync Frequency
          </Column>
          <Column className="text-xs font-bold text-right text-foreground">
            {syncFrequency}
          </Column>
        </Row>
      </EmailInfoCard>

      <Section className="text-center my-6">
        <EmailButton href={configureUrl}>Configure Settings</EmailButton>
      </Section>

      <Section className="my-6">
        <Text className="text-sm text-muted-foreground">
          If the button above doesn&apos;t work, click the following link:
        </Text>
        <EmailLink href={configureUrl}>{configureUrl}</EmailLink>
      </Section>
    </EmailLayout>
  );
}

IntegrationConnectedMail.PreviewProps = {
  adminName: "John Doe",
  appName: "App name",
  supportMail: "help@app-name.com",
  integrationName: "Integration Name",
  connectedAt: "2022-01-01",
  dataSynced: "Data Synced",
  syncFrequency: "Sync Frequency",
  configureUrl: "http://localhost:3000/configure",
} as IntegrationConnectedMailProps;
