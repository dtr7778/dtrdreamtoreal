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
  QstashMailConfig,
  QstashMailResult,
  SendMailOption,
} from "../types";
import { QstashMailService } from "./QstashMail.service";

type WelcomeUserEmailOptions = Omit<
  SendMailOption,
  "from" | "subject" | "text" | "html"
> &
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

type IntegrationConnectedMailOptions = Pick<SendMailOption, "to"> &
  Omit<IntegrationConnectedMailProps, "appName" | "supportMail">;

type IntegrationErrorMailOptions = Pick<SendMailOption, "to"> &
  Omit<IntegrationErrorMailProps, "appName" | "supportMail">;

type ContactSubmittedEmailOptions = Pick<SendMailOption, "to"> &
  Omit<ContactSubmittedMailProps, "appName" | "supportMail">;

export interface ISystemMailService {
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
}

export class SystemMailService
  extends QstashMailService
  implements ISystemMailService
{
  constructor(
    private systemMailConfig: {
      appName: string;
      systemMail: string;
      supportMail: string;
    },
    qstashMailConfig: QstashMailConfig,
    qstashConfig: QstashServiceConfig,
    transport: IMailTransport
  ) {
    super(
      transport,
      true,
      qstashMailConfig,
      qstashConfig,
      `"${systemMailConfig.appName}" <${systemMailConfig.systemMail}>`
    );
  }

  public async sendWelcomeUserMail({
    to,
    ...options
  }: WelcomeUserEmailOptions): Promise<QstashMailResult> {
    return this.sendMailTemplate(
      to,
      `Welcome to ${this.systemMailConfig.appName}`,
      <WelcomeUserMail
        supportMail={this.systemMailConfig.supportMail}
        appName={this.systemMailConfig.appName}
        {...options}
      />,
      options
    );
  }

  public async sendEmailVerificationMail({
    to,
    ...options
  }: EmailVerificationMailOptions): Promise<QstashMailResult> {
    return this.sendMailTemplate(
      to,
      `Verify your email for ${this.systemMailConfig.appName}`,
      <EmailVerificationMail
        supportMail={this.systemMailConfig.supportMail}
        appName={this.systemMailConfig.appName}
        {...options}
      />
    );
  }

  public async sendPasswordResetMail({
    to,
    ...options
  }: PasswordResetEmailOptions): Promise<QstashMailResult> {
    return this.sendMailTemplate(
      to,
      `Reset your password for ${this.systemMailConfig.appName}`,
      <ResetPasswordMail
        supportMail={this.systemMailConfig.supportMail}
        appName={this.systemMailConfig.appName}
        {...options}
      />
    );
  }

  public async sendPasswordChangedMail({
    to,
    ...options
  }: PasswordChangedMailOptions): Promise<QstashMailResult> {
    return this.sendMailTemplate(
      to,
      `Password changed for ${this.systemMailConfig.appName}`,
      <PasswordChangedMail
        supportMail={this.systemMailConfig.supportMail}
        appName={this.systemMailConfig.appName}
        {...options}
      />
    );
  }

  public async sendNewDeviceLoginMail({
    to,
    ...options
  }: NewDeviceLoginEmailOptions): Promise<QstashMailResult> {
    return this.sendMailTemplate(
      to,
      `New device login detected for ${this.systemMailConfig.appName}`,
      <NewDeviceLoginMail
        supportMail={this.systemMailConfig.supportMail}
        appName={this.systemMailConfig.appName}
        {...options}
      />
    );
  }

  public async sendSuspiciousLoginMail({
    to,
    ...options
  }: SuspiciousLoginMailOptions): Promise<QstashMailResult> {
    return this.sendMailTemplate(
      to,
      `Suspicious login detected for your ${this.systemMailConfig.appName} account`,
      <SuspiciousLoginMail
        supportMail={this.systemMailConfig.supportMail}
        appName={this.systemMailConfig.appName}
        {...options}
      />
    );
  }

  public async sendRoleChangedMail({
    to,
    ...options
  }: RoleChangedMailOptions): Promise<QstashMailResult> {
    return this.sendMailTemplate(
      to,
      `Your role has been changed for ${this.systemMailConfig.appName}`,
      <RoleChangedMail
        supportMail={this.systemMailConfig.supportMail}
        appName={this.systemMailConfig.appName}
        {...options}
      />
    );
  }

  public async sendAccountLockedMail({
    to,
    ...options
  }: AccountLockedMailOptions): Promise<QstashMailResult> {
    return this.sendMailTemplate(
      to,
      `Your ${this.systemMailConfig.appName} account has been locked`,
      <AccountLockedMail
        supportMail={this.systemMailConfig.supportMail}
        appName={this.systemMailConfig.appName}
        {...options}
      />
    );
  }

  public async sendIntegrationConnectedMail({
    to,
    ...options
  }: IntegrationConnectedMailOptions): Promise<QstashMailResult> {
    return this.sendMailTemplate(
      to,
      `Integration connected for ${this.systemMailConfig.appName}`,
      <IntegrationConnectedMail
        supportMail={this.systemMailConfig.supportMail}
        appName={this.systemMailConfig.appName}
        {...options}
      />
    );
  }

  public async sendIntegrationErrorMail({
    to,
    ...options
  }: IntegrationErrorMailOptions): Promise<QstashMailResult> {
    return this.sendMailTemplate(
      to,
      `Integration error detected for ${this.systemMailConfig.appName}`,
      <IntegrationErrorMail
        supportMail={this.systemMailConfig.supportMail}
        appName={this.systemMailConfig.appName}
        {...options}
      />
    );
  }

  public async sendContactSubmittedMail({
    to,
    ...options
  }: ContactSubmittedEmailOptions): Promise<QstashMailResult> {
    return this.sendMailTemplate(
      to,
      `New contact submission from ${this.systemMailConfig.appName}`,
      <ContactSubmittedMail
        supportMail={this.systemMailConfig.supportMail}
        appName={this.systemMailConfig.appName}
        {...options}
      />
    );
  }
}
