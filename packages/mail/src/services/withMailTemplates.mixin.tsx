/** @jsxRuntime automatic */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, toPlainText } from "react-email";

import AccountLockedMail, {
  AccountLockedMailProps,
} from "../templates/auth/AccountLockedMail";
import EmailVerificationMail, {
  EmailVerificationMailProps,
} from "../templates/auth/EmailVerificationMail";
import NewDeviceLoginMail, {
  NewDeviceLoginMailProps,
} from "../templates/auth/NewDeviceLoginMail";
import PasswordChangedMail, {
  PasswordChangedMailProps,
} from "../templates/auth/PasswordChangedMail";
import ResetPasswordMail, {
  ResetPasswordMailProps,
} from "../templates/auth/ResetPasswordMail";
import RoleChangedMail, {
  RoleChangedMailProps,
} from "../templates/auth/RoleChangedMail";
import SuspiciousLoginMail, {
  SuspiciousLoginMailProps,
} from "../templates/auth/SuspiciousLoginMail";
import WelcomeMail, { WelcomeMailProps } from "../templates/auth/WelcomeMail";
import ContactReplyMail, {
  ContactReplyMailProps,
} from "../templates/contact/ContactReplyMail";
import ContactSubmittedMail, {
  ContactSubmittedMailProps,
} from "../templates/contact/ContactSubmittedMail";
import IntegrationConnectedMail, {
  IntegrationConnectedMailProps,
} from "../templates/integration/IntegrationConnectedMail";
import IntegrationErrorMail, {
  IntegrationErrorMailProps,
} from "../templates/integration/IntegrationErrorMail";
import { MailServiceConfig, SendMailOption } from "../types";

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

/** Template-based `send*Mail` methods shared by every mail service. */
export interface IMailTemplates<TResult> {
  sendWelcomeMail(options: WelcomeEmailOptions): Promise<TResult>;

  sendEmailVerificationMail(
    options: EmailVerificationMailOptions
  ): Promise<TResult>;

  sendPasswordResetMail(options: PasswordResetEmailOptions): Promise<TResult>;

  sendPasswordChangedMail(
    options: PasswordChangedMailOptions
  ): Promise<TResult>;

  sendNewDeviceLoginMail(options: NewDeviceLoginEmailOptions): Promise<TResult>;

  sendSuspiciousLoginMail(
    options: SuspiciousLoginMailOptions
  ): Promise<TResult>;

  sendRoleChangedMail(options: RoleChangedMailOptions): Promise<TResult>;

  sendAccountLockedMail(options: AccountLockedMailOptions): Promise<TResult>;

  sendIntegrationConnectedMail(
    options: IntegrationConnectedMailOptions
  ): Promise<TResult>;

  sendIntegrationErrorMail(
    options: IntegrationErrorMailOptions
  ): Promise<TResult>;

  sendContactSubmittedMail(
    options: ContactSubmittedEmailOptions
  ): Promise<TResult>;

  sendContactReplyMail(options: ContactReplyEmailOptions): Promise<TResult>;
}

/** Transport surface the template mailer needs from its host service. */
export interface MailTemplateTransport<TResult> {
  sendMail(options: SendMailOption, isSystemMail?: boolean): Promise<TResult>;
}

type AbstractConstructor<T> = abstract new (...args: any[]) => T;

/**
 * Adds the shared template mailer methods to a mail transport service.
 *
 * @param Base - the transport service (QStash/BullMQ) to extend.
 * @returns an abstract class that renders a mail template and delegates the
 * actual send to the host service's `sendMail` method.
 */
export function withMailTemplates<
  TResult,
  TBase extends AbstractConstructor<MailTemplateTransport<TResult>>,
>(Base: TBase) {
  abstract class TemplateMailer
    extends Base
    implements IMailTemplates<TResult>
  {
    constructor(...args: any[]) {
      super(...args);
    }

    public abstract readonly mailConfig: MailServiceConfig;

    public async sendMailTemplate(
      from: string,
      to: string | string[],
      subject: string,
      component: React.ReactNode,
      isSystemMail: boolean = true,
      options: Partial<SendMailOption> = {}
    ): Promise<TResult> {
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
    }: WelcomeEmailOptions): Promise<TResult> {
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
    }: EmailVerificationMailOptions): Promise<TResult> {
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
    }: PasswordResetEmailOptions): Promise<TResult> {
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
    }: PasswordChangedMailOptions): Promise<TResult> {
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
    }: NewDeviceLoginEmailOptions): Promise<TResult> {
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
    }: SuspiciousLoginMailOptions): Promise<TResult> {
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
    }: RoleChangedMailOptions): Promise<TResult> {
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
    }: AccountLockedMailOptions): Promise<TResult> {
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
    }: IntegrationConnectedMailOptions): Promise<TResult> {
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
    }: IntegrationErrorMailOptions): Promise<TResult> {
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
    }: ContactSubmittedEmailOptions): Promise<TResult> {
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
    }: ContactReplyEmailOptions): Promise<TResult> {
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

  return TemplateMailer;
}
