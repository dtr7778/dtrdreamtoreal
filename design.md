# DTR Design System

Source of truth: `packages/ui/src/styles/globals.css`.
Consumed by `apps/web`, `apps/storybook`, and every package importing `@workspace/ui`.

## Stack

- **Tailwind CSS v4** (`@import "tailwindcss"`) — CSS-first config, no `tailwind.config.js`.
- **shadcn/ui** (`@import "shadcn/tailwind.css"`).
- **tw-animate-css** for animation utilities.
- Tokens declared as CSS custom properties, surfaced to Tailwind via `@theme inline`.

## Token Architecture

The system uses a semantic (not primitive) token layer. Components must only
consume semantic tokens — never raw color/magnitude values.

```
globals.css :root / .dark        → semantic tokens (oklch values)
        ↓
@theme inline                    → Tailwind utility namespaces (--color-*, --radius-*)
        ↓
components                       → bg-background, text-primary, rounded-lg, ...
```

### Why semantic-only?

- Dark mode is a single `.dark` override block; no component changes required.
- Theme switching (light/dark/system) stays centralized.
- Component code reads intent (`bg-card`) instead of a literal color.

## Theme Bridge (`@theme inline`)

Each semantic variable is aliased into a Tailwind namespace so utilities are
auto-generated:

| Theme token                      | Semantic source         | Generated utilities                          |
| -------------------------------- | ----------------------- | -------------------------------------------- |
| `--color-background`             | `--background`          | `bg-background`, `text-background`           |
| `--color-foreground`             | `--foreground`          | `bg-foreground`, `text-foreground`           |
| `--color-card` / `-foreground`   | `--card` / `--card-...` | `bg-card`, `text-card-foreground`            |
| `--color-popover`                | `--popover`             | `bg-popover`, `text-popover-foreground`      |
| `--color-primary`                | `--primary`             | `bg-primary`, `text-primary`, `ring-primary` |
| `--color-secondary`              | `--secondary`           | `bg-secondary`, `text-secondary-foreground`  |
| `--color-muted`                  | `--muted`               | `bg-muted`, `text-muted-foreground`          |
| `--color-accent`                 | `--accent`              | `bg-accent`, `text-accent-foreground`        |
| `--color-destructive`            | `--destructive`         | `bg-destructive`, `text-destructive`         |
| `--color-border` / `--input`     | `--border` / `--input`  | `border-border`, `border-input`              |
| `--color-ring`                   | `--ring`                | `ring-ring`                                  |
| `--color-chart-1..5`             | `--chart-1..5`          | `bg-chart-1`, `text-chart-2`, ...            |
| `--color-sidebar*`               | `--sidebar*`            | `bg-sidebar`, `text-sidebar-foreground`, ... |
| `--radius-sm..4xl`               | derived from `--radius` | `rounded-sm`, `rounded-2xl`, ...             |
| `--font-sans` / `--font-heading` | font vars from layout   | `font-sans`, `font-heading`                  |

## Color Tokens

Values use `oklch()`. `--background`/`--foreground` pair is the base surface;
all other pairs are foreground/background combinations.

### Core surfaces & text

| Token                  | Light                      | Dark                       | Purpose          |
| ---------------------- | -------------------------- | -------------------------- | ---------------- |
| `--background`         | `oklch(1 0 0)`             | `oklch(0.148 0.004 228.8)` | Page background  |
| `--foreground`         | `oklch(0.148 0.004 228.8)` | `oklch(0.987 0.002 197.1)` | Default text     |
| `--card`               | `oklch(1 0 0)`             | `oklch(0.218 0.008 223.9)` | Raised surface   |
| `--card-foreground`    | `oklch(0.148 0.004 228.8)` | `oklch(0.987 0.002 197.1)` | Text on card     |
| `--popover`            | `oklch(1 0 0)`             | `oklch(0.218 0.008 223.9)` | Floating surface |
| `--popover-foreground` | `oklch(0.148 0.004 228.8)` | `oklch(0.987 0.002 197.1)` | Text on popover  |

### Brand & intent

| Token                    | Light                        | Dark                         | Purpose                      |
| ------------------------ | ---------------------------- | ---------------------------- | ---------------------------- |
| `--primary`              | `oklch(0.505 0.213 27.518)`  | `oklch(0.444 0.177 26.899)`  | Brand red, primary actions   |
| `--primary-foreground`   | `oklch(0.971 0.013 17.38)`   | `oklch(0.971 0.013 17.38)`   | Text on primary              |
| `--secondary`            | `oklch(0.967 0.001 286.375)` | `oklch(0.274 0.006 286.033)` | Secondary actions            |
| `--secondary-foreground` | `oklch(0.21 0.006 285.885)`  | `oklch(0.985 0 0)`           | Text on secondary            |
| `--muted`                | `oklch(0.963 0.002 197.1)`   | `oklch(0.275 0.011 216.9)`   | Subdued surface              |
| `--muted-foreground`     | `oklch(0.56 0.021 213.5)`    | `oklch(0.723 0.014 214.4)`   | Subdued text                 |
| `--accent`               | `oklch(0.963 0.002 197.1)`   | `oklch(0.275 0.011 216.9)`   | Hover/active surface         |
| `--accent-foreground`    | `oklch(0.218 0.008 223.9)`   | `oklch(0.987 0.002 197.1)`   | Text on accent               |
| `--destructive`          | `oklch(0.577 0.245 27.325)`  | `oklch(0.704 0.191 22.216)`  | Errors / destructive actions |
| `--border`               | `oklch(0.925 0.005 214.3)`   | `oklch(1 0 0 / 10%)`         | Default border               |
| `--input`                | `oklch(0.925 0.005 214.3)`   | `oklch(1 0 0 / 15%)`         | Input border                 |
| `--ring`                 | `oklch(0.723 0.014 214.4)`   | `oklch(0.56 0.021 213.5)`    | Focus ring                   |

> In dark mode `--border` and `--input` use translucent white so surfaces
> blend over any background.

### Charts

Identical in light and dark; a blue sequential ramp for data viz.

| Token       | Value                        |
| ----------- | ---------------------------- |
| `--chart-1` | `oklch(0.828 0.111 230.318)` |
| `--chart-2` | `oklch(0.685 0.169 237.323)` |
| `--chart-3` | `oklch(0.588 0.158 241.966)` |
| `--chart-4` | `oklch(0.5 0.134 242.749)`   |
| `--chart-5` | `oklch(0.443 0.11 240.79)`   |

### Sidebar

Sidebar has its own token set so navigation can theme independently of content.

| Token                          | Light                       | Dark                        |
| ------------------------------ | --------------------------- | --------------------------- |
| `--sidebar`                    | `oklch(0.987 0.002 197.1)`  | `oklch(0.218 0.008 223.9)`  |
| `--sidebar-foreground`         | `oklch(0.148 0.004 228.8)`  | `oklch(0.987 0.002 197.1)`  |
| `--sidebar-primary`            | `oklch(0.577 0.245 27.325)` | `oklch(0.637 0.237 25.331)` |
| `--sidebar-primary-foreground` | `oklch(0.971 0.013 17.38)`  | `oklch(0.971 0.013 17.38)`  |
| `--sidebar-accent`             | `oklch(0.963 0.002 197.1)`  | `oklch(0.275 0.011 216.9)`  |
| `--sidebar-accent-foreground`  | `oklch(0.218 0.008 223.9)`  | `oklch(0.987 0.002 197.1)`  |
| `--sidebar-border`             | `oklch(0.925 0.005 214.3)`  | `oklch(1 0 0 / 10%)`        |
| `--sidebar-ring`               | `oklch(0.723 0.014 214.4)`  | `oklch(0.56 0.021 213.5)`   |

## Radius

Single base token `--radius: 0.625rem` (10px), with a derived scale in
`@theme inline`:

| Utility       | Formula                     | Rendered (base 10px) |
| ------------- | --------------------------- | -------------------- |
| `rounded-sm`  | `calc(var(--radius) * 0.6)` | 6px                  |
| `rounded-md`  | `calc(var(--radius) * 0.8)` | 8px                  |
| `rounded-lg`  | `var(--radius)`             | 10px                 |
| `rounded-xl`  | `calc(var(--radius) * 1.4)` | 14px                 |
| `rounded-2xl` | `calc(var(--radius) * 1.8)` | 18px                 |
| `rounded-3xl` | `calc(var(--radius) * 2.2)` | 22px                 |
| `rounded-4xl` | `calc(var(--radius) * 2.6)` | 26px                 |

Change `--radius` once to rescale the whole UI.

## Typography

Fonts are injected by `apps/web/app/layout.tsx` via `next/font/google` and
exposed as CSS variables:

| Variable         | Font          | Tailwind utility | Use                           |
| ---------------- | ------------- | ---------------- | ----------------------------- |
| `--font-sans`    | IBM Plex Sans | `font-sans`      | Body copy (default on `body`) |
| `--font-heading` | Space Grotesk | `font-heading`   | Headings                      |
| `--font-mono`    | Geist Mono    | `font-mono`      | Code                          |

`@theme inline` maps `--font-heading` to the sans variable and declares
`--font-sans`, generating the `font-*` utilities. Use `font-heading` on
headings (see `PublicAuditReport.tsx`) and the default `font-sans` elsewhere.

## Dark Mode

- Registered via `@custom-variant dark (&:is(.dark *))`.
- Driven by a `.dark` class on an ancestor (typically `<html>`), managed by
  `next-themes` through `apps/web/components/providers/theme-provider`.
- Only the token values change — component classes stay identical.

## Base Layer Rules

Applied globally in `@layer base`:

- `* { @apply border-border outline-ring/50; }` — default border color and
  outline color for every element.
- `body { @apply bg-background text-foreground; }` — base surface/text.
- `button:not(:disabled), [role="button"]:not(:disabled) { cursor: pointer; }`.

## Component Helpers

Defined in `@layer components`:

| Class                | Definition                                                       |
| -------------------- | ---------------------------------------------------------------- |
| `.__react-hot-toast` | `rounded-lg border bg-popover text-popover-foreground shadow-md` |
| `.link`              | `hover:underline`                                                |

## Usage Rules

1. **Never hardcode colors, radii, or font sizes.** Use tokens/utilities
   (`bg-card`, `text-muted-foreground`, `rounded-lg`, `font-heading`).
2. **Pair every foreground with its background** (`bg-primary` +
   `text-primary-foreground`) so contrast holds in both themes.
3. **Opacity modifiers are encouraged**: `bg-primary/10`, `border-border/50`.
4. **Prefer semantic tokens over chart/sidebar tokens** outside their domain.
5. **Add new tokens in all three places**:
   - the value in `:root`,
   - the override in `.dark` (if theme-dependent),
   - the `@theme inline` alias so a Tailwind utility exists.
6. **No new `tailwind.config.*`** — extend via `@theme` in `globals.css`.

## Files

| File                                               | Role                                  |
| -------------------------------------------------- | ------------------------------------- |
| `packages/ui/src/styles/globals.css`               | Token + theme source of truth         |
| `packages/ui/src/components/*`                     | shadcn/ui components consuming tokens |
| `apps/web/app/layout.tsx`                          | Loads fonts, sets `font-sans` on body |
| `apps/web/components/providers/theme-provider.tsx` | Light/dark/system switching           |
