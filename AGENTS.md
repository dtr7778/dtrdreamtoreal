<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# DTR - Dream To Real

## Project Structure

- **Monorepo**: pnpm workspaces + Turborepo
- **Apps**: `apps/web` (Next.js 16 web application)
- **Packages**: `packages/ui` (shared UI components), `packages/eslint-config` (shared eslint config), `packages/typescript-config` (shared typescript config)

## Key Commands

```bash
# Root commands (via Turborepo)
pnpm build          # Build all packages
pnpm dev            # Start dev server (web app)
pnpm lint           # Lint all packages
pnpm format         # Format all packages
pnpm typecheck      # Typecheck all packages

# Single package (from root)
pnpm --filter web build
pnpm --filter @workspace/ui lint

# Commit helper (Commitizen)
pnpm commit
```

## Git Hooks

- **pre-commit**: lint-staged runs ESLint on staged files
- **commit-msg**: commitlint validates commit messages
