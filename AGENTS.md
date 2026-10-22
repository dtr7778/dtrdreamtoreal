# DTR - Dream To Real

DTR is a software development and digital marketing SEO/AIO/AEO/GEO focused SaaS. This repo is a Turborepo monorepo with:

- Two TanStack Start + React 19 apps (`apps/tanstack-web`, a public web app, and `apps/tanstack-dashboard`, an internal dashboard) that build with Vite and deploy to Cloudflare Workers via Wrangler.
- `apps/hono-backend`, a Hono API worker deployed with Wrangler. It hosts the realtime Durable Objects (`ChatHubDurableObject`, `TaskHubDurableObject`) and the RPC entrypoints (`AuthEntrypoint`, `TaskEntrypoint`) that the dashboard reaches through service bindings. The dashboard's oRPC `task` feature publishes task change events via `TaskEntrypoint`.
- `apps/storybook`, a Storybook component explorer.
- Shared packages: a shadcn/ui component library (`@workspace/ui`), a Drizzle schema and DB tooling (`@workspace/drizzle`), auth (`@workspace/auth`), transactional email templates (`@workspace/mail`), server-side core logic (`@workspace/server-core`), shared utilities (`@workspace/lib`), a shared TanStack Start package for cross-app head/SEO metadata and favicon/PWA assets (`@workspace/tanstack-start`), and shared config packages (`@workspace/eslint-config`, `@workspace/typescript-config`, `@workspace/vite-config`, `@workspace/vitest-config`).

> Older notes describe a Next.js app with an Express API and a BullMQ worker. That stack does not exist in this repo — ignore it.

## Maintaining this file

Keep `AGENTS.md` current for **medium and large changes** — adding/removing an app or package, architecture or interface shifts, schema/tooling/config changes, CI changes, or anything that alters how components fit together. Do **not** update it for routine, localized code edits.

Use graphify to decide significance:

- Run `graphify update .` after the change, then `graphify query "<area you changed>"` (or inspect `GRAPH_REPORT.md` god nodes/communities).
- If the change alters the repo's structure, public interfaces, or the graph's god nodes/communities, update this file.
- If it only touches the internals of an existing unit, skip it.

## Monorepo

- **pnpm workspaces + Turborepo**; Node `>=24` (`.nvmrc` is `24.20.0`), pnpm `12.6.0` (`packageManager` in root `package.json`, pinned in CI).
- `apps/*` are deployables (`tanstack-web`, `tanstack-dashboard`, `hono-backend`, `storybook`), `packages/*` are shared libraries. `infra/docker` holds local dev containers.
- Shared dependency versions are pinned once via pnpm **`catalog:`** in `pnpm-workspace.yaml`. Add a version there and reference it as `"catalog:"` — do not hardcode versions in leaf `package.json`s.

## Commands

Run from the repo root (Turbo fans out to affected workspaces):

- `pnpm install` — install/link the workspace.
- `pnpm dev` — start all dev servers (`turbo dev`).
- `pnpm build` / `pnpm lint` / `pnpm lint:fix` / `pnpm typecheck` / `pnpm test` — Turbo tasks.
- `pnpm format` — prettier across workspaces.
- `pnpm generate-routes` — regenerate TanStack Router route trees (`turbo generate-routes`).
- `pnpm cf-typegen` — regenerate Cloudflare Worker types (`turbo cf-typegen`).
- `pnpm commit` — conventional-commit prompt (`cz`).
- `pnpm test:projects` / `pnpm test:projects:watch` — root Vitest projects (incl. Storybook browser tests).
- `pnpm docker:dev:up` / `pnpm docker:dev:down` — local resend-dev containers (`infra/docker/docker-compose-dev.yml`).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

<!-- BEGIN:turborepo-agent-rules -->

## This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
