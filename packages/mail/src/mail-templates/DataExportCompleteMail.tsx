import { Column, Row, Section, Text } from "react-email";

import { EmailButton } from "../shared/EmailButton";
import {
  EmailHeading,
  EmailInfoCard,
  EmailLayout,
} from "../shared/EmailLayout";
import { EmailLink } from "../shared/EmailLink";

export interface DataExportCompleteMailProps {
  userName: string;
  appName: string;
  supportMail: string;
  exportType: string; // "All Client Data", "Invoices (2023)"
  dateRange: string; // "Jan 1, 2023 - Oct 31, 2023"
  fileFormat: string; // "CSV", "XLSX", "JSON"
  fileSize: string; // "4.2 MB"
  recordsExported: number;
  downloadUrl: string;
  expiryTime: string; // "24 hours"
}

export default function DataExportCompleteMail({
  userName,
  appName,
  supportMail,
  exportType,
  dateRange,
  fileFormat,
  fileSize,
  recordsExported,
  downloadUrl,
  expiryTime,
}: DataExportCompleteMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText="Your data export is ready"
      supportMail={supportMail}
    >
      <EmailHeading>📦 Data Export Ready</EmailHeading>
      <Text>Hello {userName},</Text>
      <Text>
        Your requested export for{" "}
        <span className="font-bold">{exportType}</span> has been processed and
        is ready for download.
      </Text>

      <EmailInfoCard>
        <Row className="mb-2">
          <Column className="text-xs text-muted-foreground">Date Range</Column>
          <Column className="text-xs font-bold text-right text-foreground">
            {dateRange}
          </Column>
        </Row>
        <Row className="mb-2">
          <Column className="text-xs text-muted-foreground">
            Records Exported
          </Column>
          <Column className="text-xs font-bold text-right text-foreground">
            {recordsExported.toLocaleString()}
          </Column>
        </Row>
        <Row className="mb-2">
          <Column className="text-xs text-muted-foreground">
            Format & Size
          </Column>
          <Column className="text-xs font-bold text-right text-foreground">
            {fileFormat} • {fileSize}
          </Column>
        </Row>
      </EmailInfoCard>

      <Section className="text-center my-6">
        <EmailButton href={downloadUrl}>Download Export</EmailButton>
      </Section>

      <Section className="my-6">
        <Text className="text-sm text-muted-foreground">
          If the button above doesn&apos;t work, click the following link:
        </Text>
        <EmailLink href={downloadUrl}>{downloadUrl}</EmailLink>
      </Section>

      <EmailInfoCard>
        <Text className="text-xs text-destructive font-semibold m-0 text-center">
          ⏳ For security reasons, this download link will expire in{" "}
          {expiryTime}.
        </Text>
      </EmailInfoCard>
    </EmailLayout>
  );
}

DataExportCompleteMail.PreviewProps = {
  userName: "John Doe",
  appName: "App name",
  supportMail: "help@app-name.com",
  exportType: "All Client Data",
  dateRange: "Jan 1, 2023 - Oct 31, 2023",
  fileFormat: "CSV",
  fileSize: "4.2 MB",
  recordsExported: 12345,
  downloadUrl: "http://localhost:3000/dashboard/data-export",
  expiryTime: "24 hours",
} as DataExportCompleteMailProps;
