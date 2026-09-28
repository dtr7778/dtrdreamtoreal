# syntax=docker/dockerfile:1

# Multi-stage image for the backend (pnpm + Turborepo monorepo).
#
# The build context MUST be the repository root because the backend consumes
# the workspace packages as TypeScript source and the lockfile lives at the root:
#
#   docker build -f apps/backend/Dockerfile -t dtr-backend .
#
# Runtime command defaults to the API server. To run the queue worker instead:
#   docker run dtr-backend node dist/worker.js

ARG NODE_VERSION=24

# ---------------------------------------------------------------------------
# base: shared Node + pnpm toolchain
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    CI=true \
    HUSKY=0
RUN npm install -g pnpm@12.6.0
WORKDIR /app

# ---------------------------------------------------------------------------
# pruner: reduce the monorepo to the backend and its workspace dependencies
# ---------------------------------------------------------------------------
FROM base AS pruner
COPY . .
RUN pnpm dlx turbo prune backend --docker --out-dir /out

# ---------------------------------------------------------------------------
# builder: install the pruned workspace, then bundle the backend
# ---------------------------------------------------------------------------
FROM base AS builder
COPY --from=pruner /out/json/ ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store
COPY --from=pruner /out/full/ ./
RUN pnpm --filter @workspace/tsup-config build \
    && pnpm --filter backend build

# ---------------------------------------------------------------------------
# prod-deps: minimal production node_modules
#
# tsup bundles the @workspace/* packages into dist, so they are dropped from
# the manifest before `pnpm deploy` to avoid shipping their (large) trees.
# ---------------------------------------------------------------------------
FROM builder AS prod-deps
RUN node -e "const fs=require('fs');const p='apps/backend/package.json';const j=JSON.parse(fs.readFileSync(p));for(const k of Object.keys(j.dependencies||{})){if(k.startsWith('@workspace/'))delete j.dependencies[k];}fs.writeFileSync(p,JSON.stringify(j,null,2));" \
    && pnpm --filter backend deploy --prod --no-optional --legacy /prod/backend \
    && find /prod/backend -name '*.map' -delete

# ---------------------------------------------------------------------------
# runner: slim runtime image
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runner
ENV NODE_ENV=production \
    PORT=8000
WORKDIR /app
RUN addgroup -S -g 1001 nodejs \
    && adduser -S -u 1001 -G nodejs nodejs
COPY --from=prod-deps --chown=nodejs:nodejs /prod/backend ./
USER nodejs
EXPOSE 8000
CMD ["node", "dist/index.js"]
