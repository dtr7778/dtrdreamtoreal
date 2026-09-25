# BullMQ Mail Architecture v2 — Design

Date: 2026-09-25
Status: Approved for planning
Scope: `@workspace/mail` BullMQ path, `@workspace/contract` mail contract, `apps/backend` mail module, `apps/web` mail/auth wiring, `@workspace/auth` mailer interface.

## 1. Problem & Goal

The current BullMQ mail path renders React Email templates and persists the
outbound email **on the caller side** (web), then sends only `{ emailId,
dedupKey, threadId }` over HTTP to the backend, which enqueues a `mail/send`
job carrying `emailId`. The `dedupKey` is computed but never enforced on the
BullMQ path.

The goal is to move template resolution, rendering, deduplication and
persistence into a backend service, and make the caller-side API
template-oriented:

```ts
mailer.send({
  template: "welcome",
  data: { userName, dashboardUrl },
  subject: "Welcome to Acme",
  to: "jane@example.com",
});
```

`appName` and `supportMail` are injected server-side from mail config; the
caller never sends them.

A generic, template-less send is also added for callers that already have
`html`/`text`:

```ts
mailer.sendRaw({
  to: "jane@example.com",
  subject: "Hi",
  html: "<p>Hi</p>",
});
```

### Out of scope

- QStash: `QstashMail.service.ts`, `QstashMailer.service.ts`,
  `createQstashMailer.factory.ts`, `withMailTemplates.mixin.tsx`,
  `apps/web/lib/mail/qstash-mail.ts`, and all `apps/web/app/api/qstash/*`
  routes are **not modified** and must not be used as a design reference.
- The BullMQ worker (`Mail.worker.ts`) and `mail.queue.ts` are unchanged.
- Rate limiting is not part of this design.

## 2. Decisions (locked)

1. Rendering + persistence happen in the **backend service before enqueue**.
   The worker stays as-is (loads `emailId`, sends via Resend).
2. Template name → data is a **Zod-backed registry**; the payload is a
   discriminated union.
3. Caller sends `{ template, data, subject, to }` plus optional `cc`, `bcc`,
   `replyTo`; per-template sender (`systemMail` vs `supportMail`) and
   `isSystemMail` are declared in the registry.
4. `to` is required for every mail; `cc`, `bcc`, `replyTo` are optional.
5. Dedup is an **atomic `SET NX EX`** claim; a duplicate throws
   `MailError` 409; the key is released if enqueue fails.
6. The orchestrating service lives in the backend
   (`apps/backend/src/modules/mail/Mail.service.ts`).
7. `POST /mails` keeps **HMAC signature verification + AuthMiddleware +
   AuthGuard**.
8. The BullMQ mailer exposes a single generic `send()` (and `sendRaw()`);
   the named `send*Mail` methods are removed from the BullMQ path.
9. `auth.config.ts` moves to the generic `{ send(payload) }` interface; the web
   auth switches from `qstashMail` to the BullMQ publisher.
10. The generic non-template send is a **separate route** `POST /mails/raw`
    with a separate client method `sendRaw()`.
11. Raw payload: `to` (required), `cc`, `bcc`, `replyTo`, `subject`, `html` or
    `text` (at least one required), optional `from` (defaults to
    `systemMail`). Raw mail is system mail (no thread creation).
12. Dedup key material: `<templateName | "raw"> | <sorted recipients> |
<subject>`.

## 3. Target Flow

```
caller
 └─ BullmqMailPublisherService.send(payload)      @workspace/mail (thin)
      │   validate payload (Zod) → sign (HMAC) → publisher.enqueue({queue:"mail", job:"send", payload}, signature)
      ├─ web publisher  → apiClient.mail.send       → POST /mails
      └─ backend publisher → MailService.send(payload)        (in-process, no HTTP)

BullmqMailPublisherService.sendRaw(payload)
      ├─ web publisher  → apiClient.mail.raw        → POST /mails/raw
      └─ backend publisher → MailService.sendRaw(payload)

POST /mails      → Mail.controller.sendMail
   AuthMiddleware + AuthGuard → QueueSignatureService.verifyOrThrow(body, sig)
   → MailService.send(body)

POST /mails/raw  → Mail.controller.sendRawMail
   AuthMiddleware + AuthGuard → QueueSignatureService.verifyOrThrow(body, sig)
   → MailService.sendRaw(body)

MailService.send(payload)                 apps/backend/src/modules/mail/Mail.service.ts
  1. resolve registry entry; validate `data` against entry schema (400 on failure)
  2. dedup claim: SET mail:dedup:<hash> NX EX dedupWindowSeconds  (409 if held)
  3. render react-email with {...data, appName, supportMail}
  4. build SendMailOption (from = systemMail|supportMail per registry entry)
  5. if !isSystemMail: findOrCreateThread
  6. persist outbound email row via EmailService → emailId
  7. enqueue via MailQueueService.sendMail({ emailId, threadId, dedupKey })
  8. on enqueue failure: DEL dedup key, rethrow
  → { jobId, queue }

MailService.sendRaw(payload)
  Same steps, but: no template resolution/render; build SendMailOption directly
  from { html, text, from: payload.from ?? systemMail, ...recipients, subject };
  isSystemMail = true; no thread.

Mail.worker (UNCHANGED): load emailId → Resend → update row
```

## 4. Components

### 4.1 `@workspace/mail` — template definitions (pure, no React)

New file `src/templates/definitions.ts`:

```ts
export const mailTemplateDefinitions = {
  welcome: {
    data: z.object({ userName: z.string(), dashboardUrl: z.url() }),
    from: "system",
    isSystemMail: true,
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
  },
  passwordReset: {
    data: z.object({
      userName: z.string(),
      resetUrl: z.url(),
      ipAddress: z.string().optional(),
    }),
    from: "system",
    isSystemMail: true,
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
  },
  contactSubmitted: {
    data: z.object({ userName: z.string() }),
    from: "system",
    isSystemMail: true,
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
  },
} as const;

export type MailTemplateName = keyof typeof mailTemplateDefinitions;
export type MailTemplateDefinition<K extends MailTemplateName> =
  (typeof mailTemplateDefinitions)[K];
export type MailTemplateData<K extends MailTemplateName> = z.infer<
  MailTemplateDefinition<K>["data"]
>;

export const mailTemplatePayloadSchema = z.discriminatedUnion("template", [
  /* one member per definition */
]);
export type TemplateMailPayload<K extends MailTemplateName = MailTemplateName> =
  {
    template: K;
    data: MailTemplateData<K>;
    subject: string;
    to: MailRecipient;
    cc?: MailRecipient;
    bcc?: MailRecipient;
    replyTo?: MailRecipient;
  };
```

`MailRecipient = string | string[]`.

`package.json` adds a subpath export so the contract can import schemas without
pulling React:

```json
"exports": {
  ".": "./src/index.ts",
  "./templates": "./src/templates/definitions.ts",
  "./components/*": "./src/components/*.tsx"
}
```

### 4.2 `@workspace/mail` — template registry (React)

New file `src/templates/registry.tsx` maps each name to its definition plus the
component:

```ts
export const mailTemplateRegistry = {
  welcome: { ...mailTemplateDefinitions.welcome, component: WelcomeUserMail },
  // ...
} satisfies Record<
  MailTemplateName,
  { component: React.ComponentType<any> } & MailTemplateDefinition<any>
>;
```

The orchestrator uses `mailTemplateRegistry[name]` to validate and render. The
existing template components are unchanged; `appName`/`supportMail` are injected
at render time.

### 4.3 `@workspace/mail` — thin publisher service

New file `src/services/BullmqMailPublisher.service.ts`:

```ts
export interface IBullmqMailPublisherService {
  send<K extends MailTemplateName>(
    payload: TemplateMailPayload<K>
  ): Promise<BullmqMailResult>;
  sendRaw(payload: RawMailPayload): Promise<BullmqMailResult>;
}

export class BullmqMailPublisherService
  extends BullmqClientService
  implements IBullmqMailPublisherService {
  // ctor: BullmqClientServiceConfig ({ signingSecret, publisher, defaultRetries? })
  // send:    parse mailTemplatePayloadSchema, enqueue({ queue:"mail", job:"send",    payload })
  // sendRaw: parse rawMailPayloadSchema,     enqueue({ queue:"mail", job:"sendRaw", payload })
}
```

No database, no Redis, no rendering. Factory
`src/factories/createBullmqMailPublisher.factory.ts`:
`createBullmqMailPublisher(configs: BullmqClientServiceConfig): IBullmqMailPublisherService`.

### 4.4 `@workspace/mail` — raw payload schema

New file `src/types/raw-mail.types.ts`:

```ts
export const rawMailPayloadSchema = z
  .object({
    to: recipientSchema,
    cc: recipientSchema.optional(),
    bcc: recipientSchema.optional(),
    replyTo: recipientSchema.optional(),
    subject: z.string().min(1),
    html: z.string().optional(),
    text: z.string().optional(),
    from: z.string().optional(),
  })
  .refine((v) => Boolean(v.html || v.text), {
    message: "Either 'html' or 'text' must be provided",
  });

export type RawMailPayload = z.infer<typeof rawMailPayloadSchema>;
```

### 4.5 `@workspace/mail` — removals & exports

Removed (BullMQ-only render/persist machinery):

- `src/services/BullmqMail.service.ts`
- `src/services/BullmqMailer.service.ts`
- `src/factories/createBullmqMailer.factory.ts`

Kept: `Email.service.ts`, `EmailThread.service.ts`,
`ResendMail.transport.ts`, `withMailTemplates.mixin.tsx` (QStash uses it),
all QStash files, all templates/components.

`src/index.ts` exports the new registry/definitions/publisher/raw types and
stops exporting `IBullmqMailerService`.

### 4.6 `@workspace/contract`

`src/contracts/mail.contract.ts`:

```ts
const sendMailContract = createContract({
  path: "/mails",
  method: "POST",
  input: { body: mailTemplatePayloadSchema },
  output: nodeApiOutputZodSchema(
    z.object({ jobId: z.string(), queue: z.string() })
  ),
  meta: { description: "Template email sending api" },
});

const sendRawMailContract = createContract({
  path: "/mails/raw",
  method: "POST",
  input: { body: rawMailPayloadSchema },
  output: nodeApiOutputZodSchema(
    z.object({ jobId: z.string(), queue: z.string() })
  ),
  meta: { description: "Raw email sending api" },
});

export type MailContractType = {
  send: InferContractType<typeof sendMailContract>;
  raw: InferContractType<typeof sendRawMailContract>;
};

export const mailContract = {
  send: sendMailContract,
  raw: sendRawMailContract,
};
```

`@workspace/contract` gains a dependency on `@workspace/mail` importing only the
`@workspace/mail/templates` subpath (no React). No dependency cycle: mail does
not depend on contract.

### 4.7 `apps/backend` — orchestrator

New `src/modules/mail/Mail.service.ts` (`@injectable`, singleton):

Dependencies (constructor injection):

- `EmailService`
- `DatabaseType` (`CONTAINER_TYPES.Drizzle`) — used to construct an
  `EmailThreadService` internally (mirrors the removed `BullmqMail.service.ts`;
  avoids adding a new DI binding)
- `MailQueueService`
- `ExtendedRedis` (`CONTAINER_TYPES.Redis`)
- mail config: `{ appName, supportMail, systemMail, dedupWindowSeconds }`

Methods:

- `send(payload: TemplateMailPayload): Promise<{ jobId; queue }>`
- `sendRaw(payload: RawMailPayload): Promise<{ jobId; queue }>`
- private `claimDedup(key): Promise<void>` — `SET key "1" NX EX ttl`; throw
  `MailError("Duplicate email suppressed within dedup window.", "MAIL_DUPLICATE_SUPPRESSED", 409)` when not set.
- private `releaseDedup(key)` — `DEL key` (rollback).
- private `generateDedupKey(kind, recipients, subject)` — `sha256` → `mail:dedup:<hash>`.

`Mail.controller.ts`:

- `POST /mails` → verify signature → `MailService.send(body)`.
- `POST /mails/raw` → verify signature → `MailService.sendRaw(body)`.
- Both return 202 `{ jobId, queue }`.

`MailQueue.service.ts` and `mail.queue.ts` unchanged.

`container/di-container.ts`:

- bind `MailService` (singleton) with Redis + EmailService + DatabaseType +
  MailQueueService + mail config (`dedupWindowSeconds: 300`).
- rebind `Mailer` to `createBullmqMailPublisher` whose `publisher.enqueue`
  dispatches on `request.job`:
  - `"send"` → `MailService.send(payload)`
  - `"sendRaw"` → `MailService.sendRaw(payload)`
- `CONTAINER_TYPES.Redis` is already bound before `Mailer` (line ~46), so the
  orchestrator's Redis dependency resolves.

### 4.8 `apps/web`

`lib/mail/bullmq-mail.ts`: build `createBullmqMailPublisher` with an `apiClient`
publisher that dispatches on `request.job` to `apiClient.mail.send` /
`apiClient.mail.raw`, forwarding the `x-bullmq-signature` header. Drops `db`,
`supportMail`, `systemMail` (rendering is server-side).

`lib/better-auth/auth.ts`: pass `bullmqMail` instead of `qstashMail`.

### 4.9 `@workspace/auth`

`src/auth.config.ts`:

- `AuthMailer` becomes:
  ```ts
  export type AuthMailer = {
    send<K extends MailTemplateName>(
      payload: TemplateMailPayload<K>
    ): Promise<{ success: boolean; error?: string }>;
  };
  ```
- Sign-up welcome hook → `config.mailer.send({ template: "welcome", data: { userName, dashboardUrl }, subject: `Welcome to ${config.appName}`, to: user.email })`.
- `sendResetPassword` → `config.mailer.send({ template: "passwordReset", data: { userName, resetUrl: url }, subject: `Reset your password for ${config.appName}`, to: user.email })`.

The web's `qstashMail` remains for webhook routes (`processInboundEmail`,
`processMailSent`, etc.) and is no longer passed to `createBetterAuth`.

## 5. Error Handling

| Condition                             | Result                                 |
| ------------------------------------- | -------------------------------------- |
| Invalid signature                     | 401 (existing `QueueSignatureService`) |
| Unknown template / invalid `data`     | 400 `MailError`                        |
| Raw payload without `html` and `text` | 400 (Zod refine)                       |
| Duplicate within dedup window         | 409 `MAIL_DUPLICATE_SUPPRESSED`        |
| Enqueue failure                       | release dedup key, 500                 |
| Render failure                        | `MailError`, no enqueue                |
| Missing recipient                     | 400 (Zod)                              |

## 6. Testing

- `mailTemplatePayloadSchema` / `rawMailPayloadSchema`: valid + invalid cases,
  `to` required, html-or-text refine.
- `MailService.send`: claims dedup atomically, renders + persists + enqueues;
  duplicate → 409; enqueue failure → key released; unknown template → 400.
  Redis, `EmailService`, the database/`EmailThreadService`, and
  `MailQueueService` mocked.
- `MailService.sendRaw`: html/text path, default `from`, dedup, enqueue.
- Contract parse test for both bodies.
- `Mail.worker` tests unchanged.

## 7. Risks & Open Points

- **AuthGuard vs server-side web call.** The web better-auth server calls the
  backend; axios does not forward the end-user session cookie automatically.
  Today's `bullmq-mail.ts` has the same shape and is unused, so this was never
  exercised. Moving web auth onto BullMQ may require forwarding cookies or
  treating the HMAC signature as the trust boundary and relaxing `AuthGuard` for
  these routes. This is flagged for the implementation plan; it is not solved by
  this design.
- **Contract → mail dependency.** Added via the schemas-only subpath to avoid
  pulling React into the contract package.
- **Dedup precision.** Raw mails dedup on `raw|recipients|subject`; two
  different bodies with the same subject/recipients inside the window will be
  suppressed. Accepted for now.
- **Removing `IBullmqMailerService`** touches `@workspace/auth` and
  `apps/backend` DI; both are migrated in this design.

## 8. File Change Summary

| Action    | Path                                                                                            |
| --------- | ----------------------------------------------------------------------------------------------- |
| Add       | `packages/mail/src/templates/definitions.ts`                                                    |
| Add       | `packages/mail/src/templates/registry.tsx`                                                      |
| Add       | `packages/mail/src/types/raw-mail.types.ts`                                                     |
| Add       | `packages/mail/src/services/BullmqMailPublisher.service.ts`                                     |
| Add       | `packages/mail/src/factories/createBullmqMailPublisher.factory.ts`                              |
| Add       | `apps/backend/src/modules/mail/Mail.service.ts`                                                 |
| Edit      | `packages/mail/package.json` (exports subpath)                                                  |
| Edit      | `packages/mail/src/index.ts`                                                                    |
| Edit      | `packages/contract/package.json` (add `@workspace/mail`)                                        |
| Edit      | `packages/contract/src/contracts/mail.contract.ts`                                              |
| Edit      | `packages/auth/src/auth.config.ts`                                                              |
| Edit      | `apps/backend/src/modules/mail/Mail.controller.ts`                                              |
| Edit      | `apps/backend/src/container/di-container.ts`                                                    |
| Edit      | `apps/backend/src/container/container-types.ts` (add `MailService`)                             |
| Edit      | `apps/web/lib/mail/bullmq-mail.ts`                                                              |
| Edit      | `apps/web/lib/better-auth/auth.ts`                                                              |
| Remove    | `packages/mail/src/services/BullmqMail.service.ts`                                              |
| Remove    | `packages/mail/src/services/BullmqMailer.service.ts`                                            |
| Remove    | `packages/mail/src/factories/createBullmqMailer.factory.ts`                                     |
| Untouched | All QStash files, `Mail.worker.ts`, `mail.queue.ts`, `MailQueue.service.ts`, `Email.service.ts` |
