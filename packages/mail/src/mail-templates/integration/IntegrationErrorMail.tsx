import { Column, Hr, Row, Section, Text } from "react-email";

import { EmailButton } from "../../shared/EmailButton";
import {
  EmailHeading,
  EmailInfoCard,
  EmailLayout,
} from "../../shared/EmailLayout";
import { EmailLink } from "../../shared/EmailLink";

export interface IntegrationErrorMailProps {
  adminName: string;
  appName: string;
  supportMail: string;
  integrationName: string;
  errorType: string;
  lastSuccessfulSync: string;
  impact: string;
  reconnectUrl: string;
}

export default function IntegrationErrorMail({
  adminName,
  appName,
  supportMail,
  integrationName,
  errorType,
  lastSuccessfulSync,
  impact,
  reconnectUrl,
}: IntegrationErrorMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText={`Action Required: ${integrationName} integration error`}
      supportMail={supportMail}
    >
      <EmailHeading>⚠️ Integration Disconnected</EmailHeading>
      <Text>Hello {adminName},</Text>
      <Text>
        The connection to <span className="font-bold">{integrationName}</span>{" "}
        has encountered an error and requires your immediate attention.
      </Text>

      <EmailInfoCard>
        <Row>
          <Column className="text-xs text-muted-foreground">Error Type</Column>
          <Column className="text-xs font-bold text-right text-destructive">
            {errorType}
          </Column>
        </Row>
        <Hr />
        <Row>
          <Column className="text-xs text-muted-foreground">Impact</Column>
          <Column className="text-xs font-bold text-right text-foreground">
            {impact}
          </Column>
        </Row>
        <Hr />
        <Row>
          <Column className="text-xs text-muted-foreground">
            Last Successful Sync
          </Column>
          <Column className="text-xs font-bold text-right text-foreground">
            {lastSuccessfulSync}
          </Column>
        </Row>
      </EmailInfoCard>

      <Text>
        To resume syncing, please reconnect your account. This usually only
        takes a moment.
      </Text>

      <Section className="text-center my-6">
        <EmailButton href={reconnectUrl}>
          Reconnect {integrationName}
        </EmailButton>
      </Section>

      <Section className="my-6">
        <Text className="text-sm text-muted-foreground">
          If the button above doesn&apos;t work, click the following link:
        </Text>
        <EmailLink href={reconnectUrl}>{reconnectUrl}</EmailLink>
      </Section>
    </EmailLayout>
  );
}

IntegrationErrorMail.PreviewProps = {
  adminName: "John Doe",
  appName: "App name",
  supportMail: "help@app-name.com",
  integrationName: "Integration Name",
  errorType: "Error Type",
  lastSuccessfulSync: "2022-01-01",
  impact: "Impact",
  reconnectUrl: "http://localhost:3000/reconnect",
} as IntegrationErrorMailProps;
