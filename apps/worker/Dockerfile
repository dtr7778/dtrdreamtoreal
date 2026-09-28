# syntax=docker/dockerfile:1

# Multi-stage image for the BullMQ worker (pnpm + Turborepo monorepo).
#
# The build context MUST be the repository root:
#   docker build -f apps/worker/Dockerfile -t dtr-worker .

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
# pruner: reduce the monorepo to the worker and its workspace dependencies
# ---------------------------------------------------------------------------
FROM base AS pruner
COPY . .
RUN pnpm dlx turbo prune worker --docker --out-dir /out

# ---------------------------------------------------------------------------
# builder: install the pruned workspace, then bundle the worker
# ---------------------------------------------------------------------------
FROM base AS builder
COPY --from=pruner /out/json/ ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store
COPY --from=pruner /out/full/ ./
RUN pnpm --filter @workspace/tsup-config build \
    && pnpm --filter worker build

# ---------------------------------------------------------------------------
# prod-deps: minimal production node_modules
#
# tsup bundles the @workspace/* packages (including @workspace/server-core), so
# they are dropped from the manifest before `pnpm deploy`.
# ---------------------------------------------------------------------------
FROM builder AS prod-deps
RUN node -e "const fs=require('fs');const p='apps/worker/package.json';const j=JSON.parse(fs.readFileSync(p));for(const k of Object.keys(j.dependencies||{})){if(k.startsWith('@workspace/'))delete j.dependencies[k];}fs.writeFileSync(p,JSON.stringify(j,null,2));" \
    && pnpm --filter worker deploy --prod --no-optional --legacy /prod/worker \
    && find /prod/worker -name '*.map' -delete

# ---------------------------------------------------------------------------
# runner: slim runtime image
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S -g 1001 nodejs \
    && adduser -S -u 1001 -G nodejs nodejs
COPY --from=prod-deps --chown=nodejs:nodejs /prod/worker ./
USER nodejs
CMD ["node", "dist/index.js"]
