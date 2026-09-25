import { type ComponentType, createElement } from "react";

import { render, toPlainText } from "react-email";

import { mailTemplateDefinitions, type MailTemplateName } from "../definitions";
import AccountLockedMail from "./auth/AccountLockedMail";
import EmailVerificationMail from "./auth/EmailVerificationMail";
import NewDeviceLoginMail from "./auth/NewDeviceLoginMail";
import PasswordChangedMail from "./auth/PasswordChangedMail";
import ResetPasswordMail from "./auth/ResetPasswordMail";
import RoleChangedMail from "./auth/RoleChangedMail";
import SuspiciousLoginMail from "./auth/SuspiciousLoginMail";
import WelcomeUserMail from "./auth/WelcomeMail";
import ContactReplyMail from "./contact/ContactReplyMail";
import ContactSubmittedMail from "./contact/ContactSubmittedMail";
import IntegrationConnectedMail from "./integration/IntegrationConnectedMail";
import IntegrationErrorMail from "./integration/IntegrationErrorMail";

/** Renders a template component with an arbitrary prop bag. */
export type MailTemplateComponent = ComponentType<Record<string, unknown>>;

const asTemplate = <P>(component: ComponentType<P>): MailTemplateComponent =>
  component as unknown as MailTemplateComponent;

/**
 * Maps every template name to its definition and React Email component. The
 * definition half is the single source of truth for validation and sender
 * selection; the component is used only at render time.
 */
export const mailTemplateRegistry = {
  welcome: {
    ...mailTemplateDefinitions.welcome,
    component: asTemplate(WelcomeUserMail),
  },
  emailVerification: {
    ...mailTemplateDefinitions.emailVerification,
    component: asTemplate(EmailVerificationMail),
  },
  passwordReset: {
    ...mailTemplateDefinitions.passwordReset,
    component: asTemplate(ResetPasswordMail),
  },
  passwordChanged: {
    ...mailTemplateDefinitions.passwordChanged,
    component: asTemplate(PasswordChangedMail),
  },
  newDeviceLogin: {
    ...mailTemplateDefinitions.newDeviceLogin,
    component: asTemplate(NewDeviceLoginMail),
  },
  suspiciousLogin: {
    ...mailTemplateDefinitions.suspiciousLogin,
    component: asTemplate(SuspiciousLoginMail),
  },
  roleChanged: {
    ...mailTemplateDefinitions.roleChanged,
    component: asTemplate(RoleChangedMail),
  },
  accountLocked: {
    ...mailTemplateDefinitions.accountLocked,
    component: asTemplate(AccountLockedMail),
  },
  integrationConnected: {
    ...mailTemplateDefinitions.integrationConnected,
    component: asTemplate(IntegrationConnectedMail),
  },
  integrationError: {
    ...mailTemplateDefinitions.integrationError,
    component: asTemplate(IntegrationErrorMail),
  },
  contactSubmitted: {
    ...mailTemplateDefinitions.contactSubmitted,
    component: asTemplate(ContactSubmittedMail),
  },
  contactReply: {
    ...mailTemplateDefinitions.contactReply,
    component: asTemplate(ContactReplyMail),
  },
} satisfies Record<
  MailTemplateName,
  {
    from: "system" | "support";
    isSystemMail: boolean;
    component: MailTemplateComponent;
  }
>;

export interface RenderMailTemplateConfig {
  appName: string;
  supportMail: string;
}

/** Render a template to `html` + `text`, injecting the shared mail config. */
export async function renderMailTemplate(
  name: MailTemplateName,
  data: Record<string, unknown>,
  config: RenderMailTemplateConfig
): Promise<{ html: string; text: string }> {
  const entry = mailTemplateRegistry[name];

  const element = createElement(entry.component, {
    ...data,
    appName: config.appName,
    supportMail: config.supportMail,
  });

  const html = await render(element);

  return { html, text: toPlainText(html) };
}
