<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# DTR - Dream To Real

DTR is a software development and digital marketing SEO/AIO/AEO/GEO focused SaaS. A Next.js web app lets users manage lead companies/employees and launch SEO/performance audits; an Express API enqueues work, and a BullMQ worker crawls sites, renders audit reports, and sends mail.

## Monorepo

- **pnpm workspaces + Turborepo**; Node `>=24` (`.nvmrc` is `24.20.0`), pnpm `10.33.4`.
- `apps/*` are deployables, `packages/*` are shared source libraries.
- Shared dependency versions are pinned once via pnpm **`catalog:`** in `pnpm-workspace.yaml`. Add a version there and reference it as `"catalog:"` — do not hardcode versions in leaf `package.json`s.
- Source packages export TypeScript directly (`./src/*.ts`); consumers bundle them (tsup `internalScope: "@workspace"`). Only `worker`/`backend` are bundled to `dist`.
- Folder layout: feature-first in `apps/web` (`features/<domain>/{api,components,hooks}`), layered in the backend packages.

## Apps

| App              | Role                                                   | Stack                                                                                                  | Dev script                       |
| ---------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | -------------------------------- |
| `apps/web`       | Next.js 16 web app + BFF routes                        | App Router, React 19, Tailwind v4, better-auth, TanStack Query/Table, Zustand, nuqs, oRPC, serwist PWA | `next dev` (3000)                |
| `apps/backend`   | REST API at `/api/v1`; enqueues jobs, serves auth      | Express 5, InversifyJS DI, controllers, better-auth node handler, CSRF + rate limit, BullMQ            | `tsup --watch`                   |
| `apps/worker`    | Background jobs: site audits, report rendering, mail   | BullMQ consumers + cron, crawl/PSI/CrUX checks, satori/resvg render, Resend                            | `tsup --watch`                   |
| `apps/storybook` | Component workshop + browser tests for `@workspace/ui` | Storybook 10, Vite, Vitest + Playwright                                                                | `vite` / `storybook dev -p 6006` |

`apps/backend` and `apps/worker` each own a `Dockerfile` and are published to GHCR by CD.

## Packages

| Package                     | Purpose                                                                                                    |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `@workspace/contract`       | Zod API contracts + the typed axios client (`createApiClient`) used by web; queue contracts via `./worker` |
| `@workspace/drizzle`        | Drizzle ORM schemas, enums, pagination, and ioRedis/upstash/mock DB clients                                |
| `@workspace/auth`           | better-auth config/client, access control, Redis secondary storage                                         |
| `@workspace/server-core`    | Backend framework shared by backend + worker: Express `BaseServer`, decorators, guards, DI helpers, cron   |
| `@workspace/lib`            | Cross-cutting: logger, bullmq/qstash, rate-limit, Supabase clients, zod schemas, utils, shared types       |
| `@workspace/redis`          | ioRedis/upstash Redis clients + `HashSerializer`                                                           |
| `@workspace/mail`           | React Email templates, transports, mail services                                                           |
| `@workspace/ai`             | `@tanstack/ai` + OpenRouter company-description prompt/service                                             |
| `@workspace/generate-image` | satori/resvg report/image rendering (worker)                                                               |
| `@workspace/ui`             | shadcn/Radix + Tailwind v4 components, hooks, global styles                                                |
| config packages             | `eslint-config`, `typescript-config`, `tsup-config`, `vitest-config`                                       |

## Architecture / data flow

1. **web** calls the API through `@workspace/contract`'s axios client (`apps/web/lib/api.ts`, CSRF-token interceptor) → `NEXT_PUBLIC_BACKEND_URL`.
2. **web** also runs its own oRPC BFF at `app/api/orpc/[[...rest]]/route.ts` (`apps/web/server/orpc.*`), plus QStash callbacks and Resend webhooks under `app/api/*`.
3. **backend** exposes controllers (`SiteAudit`, `Mail`, `ResendMail`) and produces BullMQ jobs (`@workspace/contract/worker`).
4. **worker** consumes queues, runs the audit checklist (`apps/worker/src/modules/audit/checklist/checks/*`), renders reports, sends mail via Resend.
5. Persistence is **Postgres (Supabase) via Drizzle**; Redis backs queues, rate limits, sessions, caching.

## Key Commands

```bash
# Root commands (via Turborepo)
pnpm build          # Build all packages
pnpm dev            # Dev for every app with a dev task (web, backend, worker, storybook)
pnpm lint           # Lint all packages
pnpm format         # Format all packages
pnpm typecheck      # Typecheck all packages
pnpm test           # Run tests (turbo test)
pnpm test:projects  # Root Vitest projects run (packages + apps)
pnpm test:projects:watch

# Single package (from root)
pnpm --filter web build
pnpm --filter backend dev
pnpm --filter worker start
pnpm --filter @workspace/ui lint

# Infra / setup
bash scripts/setup.sh                                      # prerequisites + .env from examples
pnpm docker:dev:up / pnpm docker:dev:down                  # local Redis + resenddev (infra/docker)
pnpm seed:storage                                          # seed Supabase storage
pnpm commit                                                # Commitizen (conventional commits)
```

Requires a local `.env` per app (copied from the corresponding `.env.example`) and the Supabase CLI for migrations.

## Environment

- Each app validates env with `@t3-oss/env-core` / `@t3-oss/env-nextjs` (see `apps/*/src/env.ts` or `apps/web/lib/env.ts`).
- Set `SKIP_ENV_VALIDATION=true` for builds/tests without real secrets (CI does this).
- Env var names are declared in `turbo.json` `globalEnv`; add new ones there so Turbo invalidates correctly.

## Database & migrations

- Schema lives in `packages/drizzle/src/schemas` (tables + enums); consumers import from `@workspace/drizzle/schemas`, `@workspace/drizzle/zod-db-enums`, etc.
- SQL migrations live in `supabase/migrations`; seed in `supabase/seed.sql`.

## Auth

- **better-auth** with the Drizzle adapter; configs in `packages/auth` (`auth.config.base.ts` plus bullmq/qstash variants). Web route `app/api/auth/[...all]` + `proxy.ts` session guard; backend mounts the node handler.

## Queues & jobs

- **BullMQ** (Redis) is the primary queue; contract definitions in `packages/contract/src/worker/contracts` (`mail`, `audit`, `audit-report`).
- **QStash** handles webhook/callback delivery on the web side (`packages/lib/qstash`, `apps/web/lib/qstash`, `apps/web/app/api/qstash/*`); the backend does not use QStash.
- Cron registration happens only in the **worker** bootstrap (`apps/worker/src/index.ts`) via `CronJobService`.

## Testing

- **Vitest** everywhere. Root `vitest.config.ts` declares projects for `packages`, `apps`, and Storybook browser tests.
- Per-app unit tests: `*.test.ts` next to source (e.g. worker audit `lib/*.test.ts`, backend controllers/services).
- Component tests run through Storybook + Playwright in the browser.

## Code conventions

- **No comments** unless explicitly requested.
- Prettier enforces ordering via `@trivago/prettier-plugin-sort-imports` + Tailwind class sorting; run `pnpm format`.
- ESLint is **flat config**, one `eslint.config.js` per workspace (root `.eslintrc.js` is legacy/root-only). lint-staged runs `eslint --max-warnings 0` on staged files.
- Conventional commits enforced by commitlint; use `pnpm commit`.

## CI/CD

- **CI** (`.github/workflows/ci.yml`): on PRs to `dev`/`main` runs `lint`, `typecheck`, `test` (matrix) then `build`, all filtered to changed workspaces (`--filter=...[origin/<base>]`); lint job also runs `pnpm audit --prod`.
- **CD** (`.github/workflows/cd.yml`): on push to `main`, detects changed apps (`backend`, `worker`, `shared`) and builds/pushes Docker images to GHCR, triggering Render deploy hooks.

## Gotchas

- `@workspace/server-core` exports `./corn-job` (**typo, intentional**) → `CronJobService`.
- `packages/server-core` owns internal `@/*` imports; each app maps `@/*` → `../../packages/server-core/src/*` in `tsconfig.json` and aliases `@` in `tsup.config.ts`. Apps must not use `@/` for their own files.
- `apps/backend` + `apps/worker` share `server-core` but keep separate DI containers and container-type symbol maps; names must stay in sync.
- Read `node_modules/next/dist/docs/` before touching `apps/web` — this Next.js differs from training data.

## Docs

- Specs and design docs live in `docs/superpowers/specs/` (e.g. the worker/backend split).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
