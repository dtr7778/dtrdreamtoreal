import { render } from "react-email";

import { QstashServiceConfig } from "@workspace/lib/qstash";

import AccountLockedMail, {
  AccountLockedMailProps,
} from "./mail-templates/auth/AccountLockedMail";
import EmailVerificationMail, {
  EmailVerificationMailProps,
} from "./mail-templates/auth/EmailVerificationMail";
import NewDeviceLoginMail, {
  NewDeviceLoginMailProps,
} from "./mail-templates/auth/NewDeviceLoginMail";
import PasswordChangedMail, {
  PasswordChangedMailProps,
} from "./mail-templates/auth/PasswordChangedMail";
import ResetPasswordMail, {
  ResetPasswordMailProps,
} from "./mail-templates/auth/ResetPasswordMail";
import RoleChangedMail, {
  RoleChangedMailProps,
} from "./mail-templates/auth/RoleChangedMail";
import SuspiciousLoginMail, {
  SuspiciousLoginMailProps,
} from "./mail-templates/auth/SuspiciousLoginMail";
import WelcomeUserMail, {
  WelcomeUserMailProps,
} from "./mail-templates/auth/WelcomeUserMail";
import ContactReplyMail, {
  ContactReplyMailProps,
} from "./mail-templates/ContactReplyMail";
import ContactSubmittedMail, {
  ContactSubmittedMailProps,
} from "./mail-templates/ContactSubmittedMail";
import DataExportCompleteMail, {
  DataExportCompleteMailProps,
} from "./mail-templates/DataExportCompleteMail";
import IntegrationConnectedMail, {
  IntegrationConnectedMailProps,
} from "./mail-templates/integration/IntegrationConnectedMail";
import IntegrationErrorMail, {
  IntegrationErrorMailProps,
} from "./mail-templates/integration/IntegrationErrorMail";
import { IQstashMailService, QstashMailService } from "./QstashMail.service";
import { ResendMailTransport } from "./ResendMail.transport";
import type {
  MailServiceConfig,
  QstashMailResult,
  SendMailOption,
} from "./types";

type WelcomeUserEmailOptions = Pick<SendMailOption, "to"> &
  Omit<WelcomeUserMailProps, "appName" | "supportMail">;

type EmailVerificationMailOptions = Pick<SendMailOption, "to"> &
  Omit<EmailVerificationMailProps, "appName" | "supportMail">;

type PasswordResetEmailOptions = Pick<SendMailOption, "to"> &
  Omit<ResetPasswordMailProps, "appName" | "supportMail">;

type PasswordChangedMailOptions = Pick<SendMailOption, "to"> &
  Omit<PasswordChangedMailProps, "appName" | "supportMail">;

type NewDeviceLoginEmailOptions = Pick<SendMailOption, "to"> &
  Omit<NewDeviceLoginMailProps, "appName" | "supportMail">;

type SuspiciousLoginMailOptions = Pick<SendMailOption, "to"> &
  Omit<SuspiciousLoginMailProps, "appName" | "supportMail">;

type RoleChangedMailOptions = Pick<SendMailOption, "to"> &
  Omit<RoleChangedMailProps, "appName" | "supportMail">;

type AccountLockedMailOptions = Pick<SendMailOption, "to"> &
  Omit<AccountLockedMailProps, "appName" | "supportMail">;

type DataExportCompleteMailOptions = Pick<SendMailOption, "to"> &
  Omit<DataExportCompleteMailProps, "appName" | "supportMail">;

type IntegrationConnectedMailOptions = Pick<SendMailOption, "to"> &
  Omit<IntegrationConnectedMailProps, "appName" | "supportMail">;

type IntegrationErrorMailOptions = Pick<SendMailOption, "to"> &
  Omit<IntegrationErrorMailProps, "appName" | "supportMail">;

type ContactSubmittedEmailOptions = Pick<SendMailOption, "to"> &
  Omit<ContactSubmittedMailProps, "appName" | "supportMail">;

type ContactReplyEmailOptions = Pick<SendMailOption, "to"> &
  Omit<ContactReplyMailProps, "appName" | "supportMail">;

export interface IMailService extends IQstashMailService {
  sendWelcomeUserMail(
    options: WelcomeUserEmailOptions
  ): Promise<QstashMailResult>;
  sendEmailVerificationMail(
    options: EmailVerificationMailOptions
  ): Promise<QstashMailResult>;
  sendPasswordResetMail(
    options: PasswordResetEmailOptions
  ): Promise<QstashMailResult>;
  sendNewDeviceLoginMail(
    options: NewDeviceLoginEmailOptions
  ): Promise<QstashMailResult>;
  sendPasswordChangedMail(
    options: PasswordChangedMailOptions
  ): Promise<QstashMailResult>;
  sendContactSubmittedMail(
    options: ContactSubmittedEmailOptions
  ): Promise<QstashMailResult>;
  sendContactReplyMail(
    options: ContactReplyEmailOptions
  ): Promise<QstashMailResult>;
  sendSuspiciousLoginMail(
    options: SuspiciousLoginMailOptions
  ): Promise<QstashMailResult>;
  sendRoleChangedMail(
    options: RoleChangedMailOptions
  ): Promise<QstashMailResult>;
  sendAccountLockedMail(
    options: AccountLockedMailOptions
  ): Promise<QstashMailResult>;
  sendDataExportCompleteMail(
    options: DataExportCompleteMailOptions
  ): Promise<QstashMailResult>;
  sendIntegrationConnectedMail(
    options: IntegrationConnectedMailOptions
  ): Promise<QstashMailResult>;
  sendIntegrationErrorMail(
    options: IntegrationErrorMailOptions
  ): Promise<QstashMailResult>;
}

export class MailService extends QstashMailService implements IMailService {
  constructor(
    private readonly mailConfig: MailServiceConfig,
    qstashConfig: QstashServiceConfig
  ) {
    const resendMailTransport = new ResendMailTransport(
      mailConfig.resendApiKey
    );
    super(resendMailTransport, mailConfig, qstashConfig);
  }

  public async sendWelcomeUserMail({
    to,
    ...options
  }: WelcomeUserEmailOptions): Promise<QstashMailResult> {
    const subject = `Welcome to ${this.mailConfig.appName}`;
    const element = (
      <WelcomeUserMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendEmailVerificationMail({
    to,
    ...options
  }: EmailVerificationMailOptions): Promise<QstashMailResult> {
    const subject = `Verify your email for ${this.mailConfig.appName}`;
    const element = (
      <EmailVerificationMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendPasswordResetMail({
    to,
    ...options
  }: PasswordResetEmailOptions): Promise<QstashMailResult> {
    const subject = `Reset your password for ${this.mailConfig.appName}`;
    const element = (
      <ResetPasswordMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendNewDeviceLoginMail({
    to,
    ...options
  }: NewDeviceLoginEmailOptions): Promise<QstashMailResult> {
    const subject = `New device login detected for ${this.mailConfig.appName}`;
    const element = (
      <NewDeviceLoginMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendPasswordChangedMail({
    to,
    ...options
  }: PasswordChangedMailOptions): Promise<QstashMailResult> {
    const subject = `Password changed for ${this.mailConfig.appName}`;

    const element = (
      <PasswordChangedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendContactSubmittedMail({
    to,
    ...options
  }: ContactSubmittedEmailOptions): Promise<QstashMailResult> {
    const subject = `New contact submission from ${this.mailConfig.appName}`;
    const element = (
      <ContactSubmittedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendContactReplyMail({
    to,
    ...options
  }: ContactReplyEmailOptions): Promise<QstashMailResult> {
    const subject = `New reply on your contact: ${options.subject}`;
    const element = (
      <ContactReplyMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendSuspiciousLoginMail({
    to,
    ...options
  }: SuspiciousLoginMailOptions): Promise<QstashMailResult> {
    const subject = `Suspicious login detected for your ${this.mailConfig.appName} account`;
    const element = (
      <SuspiciousLoginMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendRoleChangedMail({
    to,
    ...options
  }: RoleChangedMailOptions): Promise<QstashMailResult> {
    const subject = `Your role has been changed for ${this.mailConfig.appName}`;
    const element = (
      <RoleChangedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendAccountLockedMail({
    to,
    ...options
  }: AccountLockedMailOptions): Promise<QstashMailResult> {
    const subject = `Your ${this.mailConfig.appName} account has been locked`;
    const element = (
      <AccountLockedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendDataExportCompleteMail({
    to,
    ...options
  }: DataExportCompleteMailOptions): Promise<QstashMailResult> {
    const subject = `Your data export is ready for ${this.mailConfig.appName}`;
    const element = (
      <DataExportCompleteMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendIntegrationConnectedMail({
    to,
    ...options
  }: IntegrationConnectedMailOptions): Promise<QstashMailResult> {
    const subject = `Integration connected for ${this.mailConfig.appName}`;
    const element = (
      <IntegrationConnectedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public async sendIntegrationErrorMail({
    to,
    ...options
  }: IntegrationErrorMailOptions): Promise<QstashMailResult> {
    const subject = `Integration error detected for ${this.mailConfig.appName}`;
    const element = (
      <IntegrationErrorMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />
    );

    const html = await render(element);
    const text = await render(element, {
      plainText: true,
    });

    return this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }
}
