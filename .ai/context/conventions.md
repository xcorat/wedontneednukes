# [ESTABLISHED] Code Conventions

## Languages & Frameworks
- **TypeScript**: Strict mode enabled. Explicit return types on exported functions and typed prop interfaces.
- **Svelte 5**: ONLY use runes (`$state`, `$derived`, `$props`, `$effect`, `untrack`). Legacy `let:` reactivity is strictly forbidden.
- **Capturing Initial Prop State**: When initializing `$state` with a prop that is only read on mount (e.g. `initialLevels`), wrap the read in `untrack(() => ...)` to avoid compiler warnings.
- **Components & Snippets**: Use `{#snippet}` and `{@render ...}` for composition, NOT `<slot />`.
- **CSS**: Tailwind CSS v4 with CSS theme variables in `src/app.css`. Use semantic theme variables (`bg-primary`, `bg-secondary`, `bg-surface`, `bg-background`, `text-foreground`, `rounded-theme`, `shadow-theme-md`).
- **Package Manager**: **`pnpm` ONLY**. Never run `npm` or `npx`. Use `pnpm <script>` and `pnpm exec <cmd>` / `pnpm dlx <cmd>`.

## Component & Widget Architecture
- **Widgets**: Reusable, self-contained page sections live in `src/lib/components/widgets/`. Each widget defines its TypeScript prop contract and is exported via `src/lib/components/widgets/index.ts`.
- **Shared Components**: Primitives and utility UI components (`FundraiserButton`, `MenuButton`, `ThemeSwitcher`, `Turnstile`) live in `src/lib/components/`.
- **Pages**: Top-level routes in `src/routes/` are thin composition shells that arrange widgets and handle server loaders/actions.

## Naming & Structure
- **Naming**: 
  - `PascalCase` for components and widgets (`QuestionHeroWidget.svelte`, `ThemeSwitcher.svelte`).
  - `camelCase` for functions and variables.
  - `kebab-case` for file routes and directories (`ui-forms`, `two-factor`).
- **Server Code**: ONLY in `src/lib/server/` (`auth/`, `db/`, `profile/`, `account/`, `security/`). SvelteKit prevents client-side leaks.
- **Imports**: Use `$lib/` alias. Prefer named exports.

## Testing & Verification
- **Unit & Integration Tests**: Run using Node test runner via `pnpm test` (executes `tests/*.test.ts` via `tsx`).
- **Type Checking**: Run `pnpm check` (executes `svelte-kit sync && svelte-check --tsconfig ./tsconfig.json`).
- **Build Verification**: Run `pnpm build` to verify Cloudflare SSR and client bundles.
