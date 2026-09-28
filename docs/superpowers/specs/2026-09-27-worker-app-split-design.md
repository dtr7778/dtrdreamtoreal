# Backend split: `@workspace/server-core` + `apps/worker`

- Date: 2026-09-27
- Status: Implemented (see Amendment)

## Amendment (post-review, implemented)

The design below is kept for context; these review decisions supersede it:

1. **Package name is `@workspace/server-core`** (not `backend-core`), and it also
   absorbs `packages/lib/src/server/**`, moved to `server-core/src/framework`.
   `@workspace/lib/server` no longer exists; consumers use
   `@workspace/server-core/framework`.
2. **Containers AND container symbol maps stay at the app level.** Each app owns
   its DI wiring (`apps/backend/src/container/di-container.ts`,
   `apps/worker/src/container/worker-di-container.ts`) and its `*-container-types.ts`
   symbol maps. Because shared modules still need injectable tokens,
   `server-core` has parallel token maps (`src/container/container-types.ts`,
   `src/container/worker-container-types.ts`) using `Symbol.for(...)`; identity
   across packages holds via the global symbol registry. **Names must stay in
   sync.**
3. **`lib` changes:** `./server` export removed; added `QueueProducer` to the
   `bullmq` barrel and re-exported `IoRedisRateLimit.service` from
   `rate-limit/ioredis` (framework needs them).
4. **`@/` alias:** `server-core` owns internal `@/` imports. Each app's
   `tsconfig.json` maps `@/*` to `../../packages/server-core/src/*` (and includes
   `../../packages/server-core/src/express.d.ts` for the global Express
   augmentation); each app's `tsup.config.ts` aliases `@` to the resolved
   `server-core/src`.
5. **`apps/worker`** is a real app (`package.json` name `worker`) with its own
   `tsup.config.ts` and `Dockerfile` (`turbo prune worker`). CD matrix publishes
   `ghcr.io/.../worker`; `render.yaml` points at `worker:latest`.
6. Pre-existing test failures (unrelated) carried over:
   `SiteAudit.controller.test.ts` never binds `CONTAINER_TYPES.Storage`, and
   `permission.guard.test.ts` asserts role handling the guard doesn't implement.
   Both also fail at `HEAD`.

## Goal

Separate the BullMQ **worker** into its own deployable app (`apps/worker`) with its
own Docker image, so it can run as a Render.com **Background Worker** independently
of the HTTP **API** (`apps/backend`).

To avoid an app-depends-on-app relationship, the backend code shared by both
processes moves into a new source package, `@workspace/backend-core`. Both apps
keep their own bootstrap and consume core through explicit package subpath imports.

Nothing about runtime behaviour, the env schema, or the queue contracts changes.

## Non-goals

- Renaming `apps/backend` → `apps/api` (optional follow-up; would churn Docker/CD/render paths).
- Splitting audit/mail into their own domain packages (the "B1" alternative).
- Hosting the API on Render (only the worker is wired here).
- Changing how jobs are produced/consumed or any public HTTP API.

## Current coupling (evidence)

- `apps/backend/src/index.ts` (API) and `src/worker.ts` (worker) both import `./env`,
  `@workspace/lib/server` (`BullMqService`), and the queue contracts
  `modules/audit/audit.queue.ts`, `modules/audit/audit-report.queue.ts`,
  `modules/mail/mail.queue.ts`.
- A dedicated worker DI container already exists:
  `src/container/worker-container/{worker-di-container.ts,worker-container-types.ts}`.
  It re-binds a subset of the API container — evidence the worker was already
  conceptually separate.
- Both containers bind nearly all of `modules/audit/**` and `modules/mail/**`
  (services, workers, clients, checklist, lib, queue services, controllers).
- `env.ts`, `decorators/`, `guards/`, `middlewares/`, `helpers/`, `lib/` are shared.
- `76` `@/`-aliased imports across `24` files; all of those files move to core.
- `apps/backend/test/` (`setup.ts`, `core/TestServer.ts`) is used by moving tests.

Only the process shells differ:

| API-only (`apps/backend`)                       | Worker-only (`apps/worker`)                 |
| ----------------------------------------------- | ------------------------------------------- |
| `server.ts` (`Server` extends `BaseServer`)     | worker bootstrap (current `worker.ts`)      |
| `index.ts` (HTTP bootstrap, cron registration)  | `loadResvg()` warm-up                       |
| auth/guard/middleware wiring (in API container) | resvg/satori report rendering               |
| controllers + cron in the API container         | worker registration in the worker container |

## Target layout

```
packages/backend-core/
  package.json                # @workspace/backend-core (source package, no build)
  tsconfig.json
  eslint.config.mjs
  vitest.config.ts
  src/
    env.ts                    # moved from apps/backend/src/env.ts
    constant.ts
    express.d.ts              # global Express augmentation
    container/
      api/                    # from container/{di-container,container-types}.ts
        api-container.ts
        api-container-types.ts
      worker/                 # from container/worker-container/*
        worker-container.ts
        worker-container-types.ts
    modules/
      audit/**                # moved verbatim
      mail/**                 # moved verbatim
    decorators/**
    guards/**
    middlewares/**
    helpers/**
    lib/**
  test/
    setup.ts
    core/TestServer.ts

apps/backend/                 # API shell (unchanged name)
  src/
    index.ts                  # API bootstrap; imports core modules/containers/env
    server.ts                 # Server class (imports core container + env)
  tsup.config.ts              # entry: src/index.ts only
  Dockerfile                  # prune target: backend (API)

apps/worker/                  # NEW worker shell
  package.json                # name: worker
  src/
    index.ts                  # from current apps/backend/src/worker.ts
  tsup.config.ts              # entry: src/index.ts
  tsconfig.json
  eslint.config.mjs
  vitest.config.ts
  Dockerfile                  # prune target: worker
```

## `@workspace/backend-core` package

### Exports (source, consumed by bundlers)

Core exposes a small set of barrel entrypoints rather than deep file paths:

```jsonc
{
  "name": "@workspace/backend-core",
  "private": true,
  "exports": {
    "./package.json": "./package.json",
    "./env": "./src/env.ts",
    "./express": "./src/express.d.ts",
    "./container/api": "./src/container/api/api-container.ts",
    "./container/worker": "./src/container/worker/worker-container.ts",
    "./modules/audit": "./src/modules/audit/index.ts",
    "./modules/mail": "./src/modules/mail/index.ts",
  },
}
```

- `src/modules/audit/index.ts` and `src/modules/mail/index.ts` are new barrels that
  re-export each module's public surface (queue contracts, queue enums, services,
  workers, clients, controllers, types) currently spread across files.
- The API `index.ts` imports the containers, queues, controllers and cron classes
  from `@workspace/backend-core/container/api` and `@workspace/backend-core/modules/audit|mail`.
- The worker `index.ts` imports only the worker container, worker classes and
  queue contracts from `@workspace/backend-core/container/worker` and
  `@workspace/backend-core/modules/audit|mail`. It never imports `container/api`.

### Internal import alias (`@/`)

Core keeps its internal `@/` imports. Resolution:

- `packages/backend-core/tsconfig.json`: `paths: { "@/*": ["./src/*"] }`.
- Each consuming app's `tsconfig.json`: `paths: { "@/*": ["../../packages/backend-core/src/*"] }`
  (for typecheck) and its `tsup.config.ts` passes
  `aliases: { "@": <coreSrcDir> }`, resolving the directory from
  `require.resolve("@workspace/backend-core/package.json")`.
- Apps must not use `@/` for their own files (they use relative or core subpaths).
- Fallback if alias resolution proves fragile: rewrite core's `@/` imports to
  relative paths during the move.

### Dependencies

- Core is a **source** package: no `build` script; apps bundle it via tsup's
  `internalScope: "@workspace"` (already configured in `@workspace/tsup-config`).
- Core declares the external packages it imports (express, better-auth, bullmq,
  drizzle-orm, inversify, resend, satori, zod, `@resvg/resvg-wasm`,
  `@fontsource/inter`, axios, `@supabase/*`, etc.) as `devDependencies` for its
  own typecheck/lint/test.
- Each app declares, in `dependencies`, the external packages **reachable from
  its own entrypoint**. tsup externalizes exactly this list; anything reachable
  but not listed gets bundled.

## New app: `apps/worker`

- `src/index.ts` — the current `apps/backend/src/worker.ts` logic, importing
  core: `env` from `@workspace/backend-core/env`, the worker container from
  `@workspace/backend-core/container/worker`, queue contracts from core, and
  `loadResvg` from `@workspace/generate-image`. Keeps SIGINT/SIGTERM graceful
  shutdown.
- `package.json` `dependencies` must include the worker's reachable externals.
  **Mandatory** entries (loaded from `node_modules` at runtime via
  `createRequire(process.cwd()/package.json)`):
  - `@resvg/resvg-wasm` (wasm resolved by `packages/generate-image/src/utils/loadResvg.ts`)
  - `@fontsource/inter` (woff files resolved by `.../utils/fonts.ts`)
    Plus the remaining reachable externals (e.g. `drizzle-orm`, `bullmq`,
    `inversify`, `resend`, `satori`, `zod`, `@t3-oss/env-core`, `axios`,
    `source-map-support`, `reflect-metadata`, `dotenv`). The exact set is confirmed
    by inspecting the built bundle (see Verification).
- `tsup.config.ts` mirrors the backend config (`target: node24`, `format: cjs`,
  `outDir: dist`, `dependencies: pkg.dependencies`, `internalScope: "@workspace"`,
  alias `@` → core src).
- `Dockerfile` mirrors `apps/backend/Dockerfile` with `turbo prune worker --docker`,
  the prod-deps strip of `@workspace/*`, and `CMD ["node", "dist/index.js"]`.
  `linux/amd64`, non-root user.

## `apps/backend` changes

- Remove `src/worker.ts` and `src/container/worker-container/**` (moved to core).
- `src/index.ts`: import `{ container }` from `@workspace/backend-core/container/api`,
  `env` from `@workspace/backend-core/env`, queues/controllers/cron from core
  `modules/*`; keep `./server`.
- `src/server.ts`: import container types + env from core.
- `tsup.config.ts`: `entry: ["src/index.ts"]` (drop `src/worker.ts`).
- `package.json`: drop deps used only by the worker (e.g. `satori`,
  `@resvg/resvg-wasm`, `@fontsource/inter`) if unreachable from the API bundle;
  keep `@workspace/backend-core` plus API externals. Exact trim confirmed by
  bundle inspection.
- `Dockerfile` unchanged in shape (still prunes `backend`).

## Build, CD and Render

- Turbo: core has no `build`; `backend` and `worker` each run `tsup build`. Test/lint/
  typecheck tasks apply to core and worker.
- `.github/workflows/cd.yml`:
  - `changes` filters: add `worker: ['apps/worker/**']`; `shared` already covers
    `packages/**` (so any core change rebuilds both apps).
  - `changes` outputs: add `worker`.
  - `publish` matrix: add
    `{ app: worker, dockerfile: apps/worker/Dockerfile, deployHookSecret: RENDER_DEPLOY_HOOK_WORKER }`.
- `render.yaml`: worker service points at
  `ghcr.io/dtr7778/dtrdreamtoreal/worker:latest` (no `dockerCommand` needed;
  the worker image's default command runs the worker). Env group unchanged.

## Verification

1. `pnpm install` succeeds with the new workspace package.
2. `pnpm lint`, `pnpm typecheck` clean.
3. `pnpm test` — all moved tests pass (core has a working vitest config + setup).
4. `pnpm --filter backend build` and `pnpm --filter worker build` succeed.
5. Bundle inspection:
   - `apps/worker/dist/index.js` does **not** contain express / better-auth.
   - `@resvg/resvg-wasm` and `@fontsource/inter` are **not** bundled (resolved at
     runtime from `node_modules`).
6. `docker build -f apps/worker/Dockerfile -t worker .` succeeds; runner has
   `dist/index.js` + prod `node_modules` with `@resvg/resvg-wasm/index_bg.wasm`
   and `@fontsource/inter/files/*.woff`.
7. Smoke: run the worker image with local Redis (`SKIP_ENV_VALIDATION`-free full
   env) and confirm `Worker is starting....` then successful BullMQ connection.

## Risks & mitigations

| Risk                                                                    | Mitigation                                                                                                            |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `@/` alias resolves to the wrong `src` when core is bundled into an app | Resolve `@` → core's `src` via `require.resolve` in each app's tsup config; fallback to relative imports in core      |
| Runtime wasm/font resolution breaks in the worker image                 | Keep `@resvg/resvg-wasm` + `@fontsource/inter` external and in worker `dependencies`; assert via bundle inspection    |
| Worker bundle accidentally pulls API-only deps (express/better-auth)    | Ensure the worker entrypoint imports only `core/container/worker` + core worker modules; assert via bundle inspection |
| Express type augmentation (`express.d.ts`) not applied in core          | Keep it in core and include it in core's tsconfig; controller typecheck verifies                                      |
| Core's external deps drift from apps' declared deps                     | Document the "reachable externals" rule; verify with bundle inspection and `pnpm deploy` output                       |
| Test harness (`TestServer`, `setup.ts`) breaks after the move           | Move `apps/backend/test/**` into core and point core's vitest setup at it                                             |

## Rollout

Single PR, no runtime behaviour change. Keep the existing `backend` image/tag
working; add the `worker` image/tag alongside. Switch `render.yaml` to the worker
image only after the worker image is verified in GHCR.
