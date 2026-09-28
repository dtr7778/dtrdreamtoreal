# syntax=docker/dockerfile:1

# Multi-stage image that runs BOTH the backend API and the BullMQ worker in a
# single container, for a single Render web service.
#
# The build context MUST be the repository root because both apps consume the
# workspace packages as TypeScript source and the lockfile lives at the root:
#
#   docker build -f apps/combined/Dockerfile -t dtr-combined .

ARG NODE_VERSION=24

# ---------------------------------------------------------------------------
# base: shared Node + pnpm toolchain
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    CI=true \
    HUSKY=0
RUN npm install -g pnpm@10.33.4
WORKDIR /app

# ---------------------------------------------------------------------------
# pruner: reduce the monorepo to the backend + worker and their workspace deps
# ---------------------------------------------------------------------------
FROM base AS pruner
COPY . .
RUN pnpm dlx turbo prune backend worker --docker --out-dir /out

# ---------------------------------------------------------------------------
# builder: install the pruned workspace, then bundle both apps
# ---------------------------------------------------------------------------
FROM base AS builder
COPY --from=pruner /out/json/ ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store
COPY --from=pruner /out/full/ ./
RUN pnpm --filter @workspace/tsup-config build \
    && pnpm --filter backend build \
    && pnpm --filter worker build

# ---------------------------------------------------------------------------
# prod-deps: minimal production node_modules for each app.
#
# The two trees stay separate so each process resolves its own runtime assets
# (worker fonts/WASM) from its own cwd. tsup bundles the @workspace/* packages
# into dist, so they are dropped from the manifests before `pnpm deploy`.
# ---------------------------------------------------------------------------
FROM builder AS prod-deps
RUN node -e "const fs=require('fs');for(const p of ['apps/backend/package.json','apps/worker/package.json']){const j=JSON.parse(fs.readFileSync(p));for(const k of Object.keys(j.dependencies||{})){if(k.startsWith('@workspace/'))delete j.dependencies[k];}fs.writeFileSync(p,JSON.stringify(j,null,2));}" \
    && pnpm --filter backend deploy --prod --no-optional --legacy /prod/api \
    && pnpm --filter worker deploy --prod --no-optional --legacy /prod/worker \
    && find /prod -name '*.map' -delete

# ---------------------------------------------------------------------------
# runner: slim runtime image running both processes via the supervisor
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runner
ENV NODE_ENV=production \
    PORT=8000
WORKDIR /app
RUN addgroup -S -g 1001 nodejs \
    && adduser -S -u 1001 -G nodejs nodejs
COPY --from=prod-deps --chown=nodejs:nodejs /prod/api ./api
COPY --from=prod-deps --chown=nodejs:nodejs /prod/worker ./worker
COPY --chown=nodejs:nodejs apps/combined/start-all.mjs ./start-all.mjs
USER nodejs
EXPOSE 8000
CMD ["node", "start-all.mjs"]