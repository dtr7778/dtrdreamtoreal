/** @jsxRuntime automatic */
import { render, toPlainText } from "react-email";

import { type IQueueMailService, QueueMailService } from "../producer";
import AccountLockedMail, {
  type AccountLockedMailProps,
} from "../templates/auth/AccountLockedMail";
import EmailVerificationMail, {
  type EmailVerificationMailProps,
} from "../templates/auth/EmailVerificationMail";
import NewDeviceLoginMail, {
  type NewDeviceLoginMailProps,
} from "../templates/auth/NewDeviceLoginMail";
import PasswordChangedMail, {
  type PasswordChangedMailProps,
} from "../templates/auth/PasswordChangedMail";
import ResetPasswordMail, {
  type ResetPasswordMailProps,
} from "../templates/auth/ResetPasswordMail";
import RoleChangedMail, {
  type RoleChangedMailProps,
} from "../templates/auth/RoleChangedMail";
import SuspiciousLoginMail, {
  type SuspiciousLoginMailProps,
} from "../templates/auth/SuspiciousLoginMail";
import WelcomeMail, {
  type WelcomeMailProps,
} from "../templates/auth/WelcomeMail";
import ContactReplyMail, {
  type ContactReplyMailProps,
} from "../templates/contact/ContactReplyMail";
import ContactSubmittedMail, {
  type ContactSubmittedMailProps,
} from "../templates/contact/ContactSubmittedMail";
import IntegrationConnectedMail, {
  type IntegrationConnectedMailProps,
} from "../templates/integration/IntegrationConnectedMail";
import IntegrationErrorMail, {
  type IntegrationErrorMailProps,
} from "../templates/integration/IntegrationErrorMail";
import type {
  MailConfig,
  MailServiceConfig,
  QueueMailResult,
  SendMailOption,
} from "../types";

type WelcomeEmailOptions = Omit<
  SendMailOption,
  "from" | "subject" | "text" | "html"
> &
  Omit<WelcomeMailProps, "appName" | "supportMail">;

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

export interface IMailService extends IQueueMailService {
  sendWelcomeMail(options: WelcomeEmailOptions): Promise<QueueMailResult>;

  sendEmailVerificationMail(
    options: EmailVerificationMailOptions
  ): Promise<QueueMailResult>;

  sendPasswordResetMail(
    options: PasswordResetEmailOptions
  ): Promise<QueueMailResult>;

  sendPasswordChangedMail(
    options: PasswordChangedMailOptions
  ): Promise<QueueMailResult>;

  sendNewDeviceLoginMail(
    options: NewDeviceLoginEmailOptions
  ): Promise<QueueMailResult>;

  sendSuspiciousLoginMail(
    options: SuspiciousLoginMailOptions
  ): Promise<QueueMailResult>;

  sendRoleChangedMail(
    options: RoleChangedMailOptions
  ): Promise<QueueMailResult>;

  sendAccountLockedMail(
    options: AccountLockedMailOptions
  ): Promise<QueueMailResult>;

  sendIntegrationConnectedMail(
    options: IntegrationConnectedMailOptions
  ): Promise<QueueMailResult>;

  sendIntegrationErrorMail(
    options: IntegrationErrorMailOptions
  ): Promise<QueueMailResult>;

  sendContactSubmittedMail(
    options: ContactSubmittedEmailOptions
  ): Promise<QueueMailResult>;

  sendContactReplyMail(
    options: ContactReplyEmailOptions
  ): Promise<QueueMailResult>;
}

export class MailService extends QueueMailService implements IMailService {
  public readonly mailConfig: MailConfig;

  constructor(config: MailServiceConfig) {
    super(config);
    this.mailConfig = config.mailConfig;
  }

  public async sendMailTemplate(
    from: string,
    to: string | string[],
    subject: string,
    component: React.ReactNode,
    isSystemMail: boolean = true,
    options: Partial<SendMailOption> = {}
  ): Promise<QueueMailResult> {
    const html = await render(component);
    const text = toPlainText(html);

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

  public async sendWelcomeMail({
    to,
    ...options
  }: WelcomeEmailOptions): Promise<QueueMailResult> {
    return this.sendMailTemplate(
      `${this.mailConfig.appName} <${this.mailConfig.systemMail}>`,
      to,
      `Welcome to ${this.mailConfig.appName}`,
      <WelcomeMail
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
  }: EmailVerificationMailOptions): Promise<QueueMailResult> {
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
  }: PasswordResetEmailOptions): Promise<QueueMailResult> {
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
  }: PasswordChangedMailOptions): Promise<QueueMailResult> {
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
  }: NewDeviceLoginEmailOptions): Promise<QueueMailResult> {
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
  }: SuspiciousLoginMailOptions): Promise<QueueMailResult> {
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
  }: RoleChangedMailOptions): Promise<QueueMailResult> {
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
  }: AccountLockedMailOptions): Promise<QueueMailResult> {
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
  }: IntegrationConnectedMailOptions): Promise<QueueMailResult> {
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
  }: IntegrationErrorMailOptions): Promise<QueueMailResult> {
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
  }: ContactSubmittedEmailOptions): Promise<QueueMailResult> {
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
  }: ContactReplyEmailOptions): Promise<QueueMailResult> {
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
