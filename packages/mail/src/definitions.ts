import { z } from "zod";

export const mailRecipientSchema = z.union([
  z.string().min(1),
  z.array(z.string().min(1)).min(1),
]);

export type MailRecipient = z.infer<typeof mailRecipientSchema>;

/** A template-less mail carrying pre-rendered content. */
export interface RawMailPayload {
  to: MailRecipient;
  cc?: MailRecipient;
  bcc?: MailRecipient;
  replyTo?: MailRecipient;
  subject: string;
  html?: string;
  text?: string;
  /** Sender override. Defaults to the configured system mail. */
  from?: string;
}

export const rawMailPayloadSchema = z
  .object({
    to: mailRecipientSchema,
    cc: mailRecipientSchema.optional(),
    bcc: mailRecipientSchema.optional(),
    replyTo: mailRecipientSchema.optional(),
    subject: z.string().min(1),
    html: z.string().optional(),
    text: z.string().optional(),
    from: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.html && !value.text) {
      ctx.addIssue({
        code: "custom",
        path: ["html"],
        message: "Either 'html' or 'text' must be provided",
      });
    }
  });

/** Context available to a template's subject builder. */
export interface MailTemplateSubjectContext {
  appName: string;
}

/**
 * Builds the subject line for a templated mail. Called on the backend (the
 * caller never sends a subject for templated mails).
 */
export type MailTemplateSubject = (
  data: Record<string, unknown>,
  context: MailTemplateSubjectContext
) => string;

/** Shape of a single template definition. */
export interface MailTemplateDefinition {
  data: z.ZodType;
  from: "system" | "support";
  isSystemMail: boolean;
  subject: MailTemplateSubject;
}

/**
 * Single source of truth for the templated mail API.
 *
 * Each entry declares the data a template needs (excluding the `appName` /
 * `supportMail` props, which are injected from mail config at render time), the
 * sender it goes out as, whether it is a system mail (system mails skip thread
 * creation), and how its subject line is built.
 */
export const mailTemplateDefinitions = {
  welcome: {
    data: z.object({ userName: z.string(), dashboardUrl: z.url() }),
    from: "system",
    isSystemMail: true,
    subject: (_data, { appName }) => `Welcome to ${appName}`,
  },
  emailVerification: {
    data: z.object({
      userName: z.string(),
      verifyUrl: z.url(),
      userAgent: z.string().optional(),
      ipAddress: z.string().optional(),
    }),
    from: "system",
    isSystemMail: true,
    subject: (_data, { appName }) => `Verify your email for ${appName}`,
  },
  passwordReset: {
    data: z.object({
      userName: z.string(),
      resetUrl: z.url(),
      ipAddress: z.string().optional(),
    }),
    from: "system",
    isSystemMail: true,
    subject: (_data, { appName }) => `Reset your password for ${appName}`,
  },
  passwordChanged: {
    data: z.object({
      userName: z.string(),
      changeTimestamp: z.string(),
      ipAddress: z.string(),
      deviceInfo: z.string(),
    }),
    from: "system",
    isSystemMail: true,
    subject: (_data, { appName }) => `Password changed for ${appName}`,
  },
  newDeviceLogin: {
    data: z.object({
      userName: z.string(),
      loginTimestamp: z.string(),
      deviceInfo: z.string(),
      browser: z.string(),
      ipAddress: z.string(),
      approximateLocation: z.string(),
      secureAccountUrl: z.url(),
    }),
    from: "system",
    isSystemMail: true,
    subject: (_data, { appName }) => `New device login detected for ${appName}`,
  },
  suspiciousLogin: {
    data: z.object({
      userName: z.string(),
      attemptTimestamp: z.string(),
      ipAddress: z.string(),
      location: z.string(),
      deviceInfo: z.string(),
      secureAccountUrl: z.url(),
    }),
    from: "system",
    isSystemMail: true,
    subject: (_data, { appName }) =>
      `Suspicious login detected for your ${appName} account`,
  },
  roleChanged: {
    data: z.object({
      userName: z.string(),
      oldRole: z.string(),
      newRole: z.string(),
      changedBy: z.string(),
      permissionsUrl: z.url(),
    }),
    from: "system",
    isSystemMail: true,
    subject: (_data, { appName }) =>
      `Your role has been changed for ${appName}`,
  },
  accountLocked: {
    data: z.object({
      userName: z.string(),
      lockTimestamp: z.string(),
      failedAttempts: z.number(),
      ipAddress: z.string(),
      unlockUrl: z.url(),
    }),
    from: "system",
    isSystemMail: true,
    subject: (_data, { appName }) => `Your ${appName} account has been locked`,
  },
  integrationConnected: {
    data: z.object({
      adminName: z.string(),
      integrationName: z.string(),
      connectedAt: z.string(),
      dataSynced: z.string(),
      syncFrequency: z.string(),
      configureUrl: z.url(),
    }),
    from: "system",
    isSystemMail: true,
    subject: (_data, { appName }) => `Integration connected for ${appName}`,
  },
  integrationError: {
    data: z.object({
      adminName: z.string(),
      integrationName: z.string(),
      errorType: z.string(),
      lastSuccessfulSync: z.string(),
      impact: z.string(),
      reconnectUrl: z.url(),
    }),
    from: "system",
    isSystemMail: true,
    subject: (_data, { appName }) =>
      `Integration error detected for ${appName}`,
  },
  contactSubmitted: {
    data: z.object({ userName: z.string() }),
    from: "system",
    isSystemMail: true,
    subject: (_data, { appName }) => `New contact submission from ${appName}`,
  },
  contactReply: {
    data: z.object({
      userName: z.string().nullish(),
      subject: z.string().nullish(),
      replyAuthor: z.string(),
      replyContent: z.string(),
    }),
    from: "support",
    isSystemMail: false,
    subject: (data) =>
      `New reply on your contact: ${String(data.subject ?? "")}`,
  },
} as const satisfies Record<string, MailTemplateDefinition>;

export type MailTemplateName = keyof typeof mailTemplateDefinitions;

export type MailTemplateData<K extends MailTemplateName> = z.infer<
  (typeof mailTemplateDefinitions)[K]["data"]
>;

/** The discriminated payload accepted by the templated mail API. */
export type TemplateMailPayload<K extends MailTemplateName = MailTemplateName> =
  {
    template: K;
    data: MailTemplateData<K>;
    to: MailRecipient;
    cc?: MailRecipient;
    bcc?: MailRecipient;
    replyTo?: MailRecipient;
  };

const mailTemplateNames = Object.keys(
  mailTemplateDefinitions
) as MailTemplateName[];

/**
 * Runtime validation for the templated payload. The envelope is validated
 * directly; `data` is validated against the schema of the selected template.
 */
export const mailTemplatePayloadSchema = z
  .object({
    template: z.enum(
      mailTemplateNames as [MailTemplateName, ...MailTemplateName[]]
    ),
    data: z.record(z.string(), z.unknown()),
    to: mailRecipientSchema,
    cc: mailRecipientSchema.optional(),
    bcc: mailRecipientSchema.optional(),
    replyTo: mailRecipientSchema.optional(),
  })
  .superRefine((value, ctx) => {
    const definition = mailTemplateDefinitions[value.template];
    const parsed = definition.data.safeParse(value.data);

    if (!parsed.success) {
      ctx.addIssue({
        code: "custom",
        path: ["data"],
        message: parsed.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; "),
      });
    }
  });

/** Per-item result of a batch mail request. */
export interface MailBatchItemResult {
  success: boolean;
  /** Backend job id (present when `success`). */
  jobId?: string;
  /** Queue the item was enqueued on (present when `success`). */
  queue?: string;
  /** Failure reason (present when not `success`). */
  error?: string;
}

export const mailBatchItemResultSchema = z.object({
  success: z.boolean(),
  jobId: z.string().optional(),
  queue: z.string().optional(),
  error: z.string().optional(),
});

/** Batch envelope for templated mails. */
export const templateMailBatchPayloadSchema = z.object({
  items: z.array(mailTemplatePayloadSchema).min(1),
});

/** Batch envelope for raw mails. */
export const rawMailBatchPayloadSchema = z.object({
  items: z.array(rawMailPayloadSchema).min(1),
});
