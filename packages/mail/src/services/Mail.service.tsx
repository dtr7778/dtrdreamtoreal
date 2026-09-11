import { render } from "react-email";

import { QstashServiceConfig } from "@workspace/lib/qstash";

import AccountLockedMail, {
  AccountLockedMailProps,
} from "../mail-templates/auth/AccountLockedMail";
import EmailVerificationMail, {
  EmailVerificationMailProps,
} from "../mail-templates/auth/EmailVerificationMail";
import NewDeviceLoginMail, {
  NewDeviceLoginMailProps,
} from "../mail-templates/auth/NewDeviceLoginMail";
import PasswordChangedMail, {
  PasswordChangedMailProps,
} from "../mail-templates/auth/PasswordChangedMail";
import ResetPasswordMail, {
  ResetPasswordMailProps,
} from "../mail-templates/auth/ResetPasswordMail";
import RoleChangedMail, {
  RoleChangedMailProps,
} from "../mail-templates/auth/RoleChangedMail";
import SuspiciousLoginMail, {
  SuspiciousLoginMailProps,
} from "../mail-templates/auth/SuspiciousLoginMail";
import WelcomeUserMail, {
  WelcomeUserMailProps,
} from "../mail-templates/auth/WelcomeUserMail";
import ContactReplyMail, {
  ContactReplyMailProps,
} from "../mail-templates/contact/ContactReplyMail";
import ContactSubmittedMail, {
  ContactSubmittedMailProps,
} from "../mail-templates/contact/ContactSubmittedMail";
import IntegrationConnectedMail, {
  IntegrationConnectedMailProps,
} from "../mail-templates/integration/IntegrationConnectedMail";
import IntegrationErrorMail, {
  IntegrationErrorMailProps,
} from "../mail-templates/integration/IntegrationErrorMail";
import {
  IMailTransport,
  MailServiceConfig,
  QstashMailConfig,
  QstashMailResult,
  SendMailOption,
} from "../types";
import { IQstashMailService, QstashMailService } from "./QstashMail.service";

type WelcomeUserEmailOptions = Omit<
  SendMailOption,
  "from" | "subject" | "text" | "html"
> &
  Omit<WelcomeUserMailProps, "appName" | "supportMail">;

type EmailVerificationMailOptions = Omit<
  SendMailOption,
  "from" | "subject" | "text" | "html"
> &
  Omit<EmailVerificationMailProps, "appName" | "supportMail">;

type PasswordResetEmailOptions = Omit<
  SendMailOption,
  "from" | "subject" | "text" | "html"
> &
  Omit<ResetPasswordMailProps, "appName" | "supportMail">;

type PasswordChangedMailOptions = Omit<
  SendMailOption,
  "from" | "subject" | "text" | "html"
> &
  Omit<PasswordChangedMailProps, "appName" | "supportMail">;

type NewDeviceLoginEmailOptions = Omit<
  SendMailOption,
  "from" | "subject" | "text" | "html"
> &
  Omit<NewDeviceLoginMailProps, "appName" | "supportMail">;

type SuspiciousLoginMailOptions = Omit<
  SendMailOption,
  "from" | "subject" | "text" | "html"
> &
  Omit<SuspiciousLoginMailProps, "appName" | "supportMail">;

type RoleChangedMailOptions = Omit<
  SendMailOption,
  "from" | "subject" | "text" | "html"
> &
  Omit<RoleChangedMailProps, "appName" | "supportMail">;

type AccountLockedMailOptions = Omit<
  SendMailOption,
  "from" | "subject" | "text" | "html"
> &
  Omit<AccountLockedMailProps, "appName" | "supportMail">;

type IntegrationConnectedMailOptions = Omit<
  SendMailOption,
  "from" | "subject" | "text" | "html"
> &
  Omit<IntegrationConnectedMailProps, "appName" | "supportMail">;

type IntegrationErrorMailOptions = Omit<
  SendMailOption,
  "from" | "subject" | "text" | "html"
> &
  Omit<IntegrationErrorMailProps, "appName" | "supportMail">;

type ContactSubmittedEmailOptions = Omit<
  SendMailOption,
  "from" | "subject" | "text" | "html"
> &
  Omit<ContactSubmittedMailProps, "appName" | "supportMail">;

type ContactReplyEmailOptions = Omit<
  SendMailOption,
  "from" | "text" | "html" | "subject"
> &
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

  sendPasswordChangedMail(
    options: PasswordChangedMailOptions
  ): Promise<QstashMailResult>;

  sendNewDeviceLoginMail(
    options: NewDeviceLoginEmailOptions
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

  sendIntegrationConnectedMail(
    options: IntegrationConnectedMailOptions
  ): Promise<QstashMailResult>;

  sendIntegrationErrorMail(
    options: IntegrationErrorMailOptions
  ): Promise<QstashMailResult>;

  sendContactSubmittedMail(
    options: ContactSubmittedEmailOptions
  ): Promise<QstashMailResult>;

  sendContactReplyMail({
    to,
    ...options
  }: ContactReplyEmailOptions): Promise<QstashMailResult>;
}

export class MailService extends QstashMailService implements IMailService {
  constructor(
    private readonly mailConfig: MailServiceConfig,
    qstashMailConfig: QstashMailConfig,
    qstashConfig: QstashServiceConfig,
    transport: IMailTransport
  ) {
    super(transport, qstashMailConfig, qstashConfig);
  }

  private async sendMailTemplate(
    from: string,
    to: string | string[],
    subject: string,
    component: React.ReactNode,
    isSystemMail: boolean = true,
    options: Partial<SendMailOption> = {}
  ): Promise<QstashMailResult> {
    const html = await render(component);
    const text = await render(component, { plainText: true });

    return this.sendMail(
      {
        ...options,
        from,
        to,
        subject,
        text,
        html,
      },
      isSystemMail
    );
  }

  public async sendWelcomeUserMail({
    to,
    ...options
  }: WelcomeUserEmailOptions): Promise<QstashMailResult> {
    return this.sendMailTemplate(
      `${this.mailConfig.appName} <${this.mailConfig.systemMail}>`,
      to,
      `Welcome to ${this.mailConfig.appName}`,
      <WelcomeUserMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />,
      true,
      options
    );
  }

  public async sendEmailVerificationMail({
    to,
    ...options
  }: EmailVerificationMailOptions): Promise<QstashMailResult> {
    return this.sendMailTemplate(
      `${this.mailConfig.appName} <${this.mailConfig.systemMail}>`,
      to,
      `Verify your email for ${this.mailConfig.appName}`,
      <EmailVerificationMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />,
      true
    );
  }

  public async sendPasswordResetMail({
    to,
    ...options
  }: PasswordResetEmailOptions): Promise<QstashMailResult> {
    return this.sendMailTemplate(
      `${this.mailConfig.appName} <${this.mailConfig.systemMail}>`,
      to,
      `Reset your password for ${this.mailConfig.appName}`,
      <ResetPasswordMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />,
      true
    );
  }

  public async sendPasswordChangedMail({
    to,
    ...options
  }: PasswordChangedMailOptions): Promise<QstashMailResult> {
    return this.sendMailTemplate(
      `${this.mailConfig.appName} <${this.mailConfig.systemMail}>`,
      to,
      `Password changed for ${this.mailConfig.appName}`,
      <PasswordChangedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />,
      true
    );
  }

  public async sendNewDeviceLoginMail({
    to,
    ...options
  }: NewDeviceLoginEmailOptions): Promise<QstashMailResult> {
    return this.sendMailTemplate(
      `${this.mailConfig.appName} <${this.mailConfig.systemMail}>`,
      to,
      `New device login detected for ${this.mailConfig.appName}`,
      <NewDeviceLoginMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />,
      true
    );
  }

  public async sendSuspiciousLoginMail({
    to,
    ...options
  }: SuspiciousLoginMailOptions): Promise<QstashMailResult> {
    return this.sendMailTemplate(
      `${this.mailConfig.appName} <${this.mailConfig.systemMail}>`,
      to,
      `Suspicious login detected for your ${this.mailConfig.appName} account`,
      <SuspiciousLoginMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />,
      true
    );
  }

  public async sendRoleChangedMail({
    to,
    ...options
  }: RoleChangedMailOptions): Promise<QstashMailResult> {
    return this.sendMailTemplate(
      `${this.mailConfig.appName} <${this.mailConfig.systemMail}>`,
      to,
      `Your role has been changed for ${this.mailConfig.appName}`,
      <RoleChangedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />,
      true
    );
  }

  public async sendAccountLockedMail({
    to,
    ...options
  }: AccountLockedMailOptions): Promise<QstashMailResult> {
    return this.sendMailTemplate(
      `${this.mailConfig.appName} <${this.mailConfig.systemMail}>`,
      to,
      `Your ${this.mailConfig.appName} account has been locked`,
      <AccountLockedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />,
      true
    );
  }

  public async sendIntegrationConnectedMail({
    to,
    ...options
  }: IntegrationConnectedMailOptions): Promise<QstashMailResult> {
    return this.sendMailTemplate(
      `${this.mailConfig.appName} <${this.mailConfig.systemMail}>`,
      to,
      `Integration connected for ${this.mailConfig.appName}`,
      <IntegrationConnectedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />,
      true
    );
  }

  public async sendIntegrationErrorMail({
    to,
    ...options
  }: IntegrationErrorMailOptions): Promise<QstashMailResult> {
    return this.sendMailTemplate(
      `${this.mailConfig.appName} <${this.mailConfig.systemMail}>`,
      to,
      `Integration error detected for ${this.mailConfig.appName}`,
      <IntegrationErrorMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />,
      true
    );
  }

  public async sendContactSubmittedMail({
    to,
    ...options
  }: ContactSubmittedEmailOptions): Promise<QstashMailResult> {
    return this.sendMailTemplate(
      `${this.mailConfig.appName} <${this.mailConfig.systemMail}>`,
      to,
      `New contact submission from ${this.mailConfig.appName}`,
      <ContactSubmittedMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />,
      true
    );
  }

  public async sendContactReplyMail({
    to,
    ...options
  }: ContactReplyEmailOptions): Promise<QstashMailResult> {
    return this.sendMailTemplate(
      `${this.mailConfig.appName} <${this.mailConfig.supportMail}>`,
      to,
      `New reply on your contact: ${options.subject}`,
      <ContactReplyMail
        supportMail={this.mailConfig.supportMail}
        appName={this.mailConfig.appName}
        {...options}
      />,
      false,
      {
        replyTo: this.mailConfig.supportMail,
      }
    );
  }
}
