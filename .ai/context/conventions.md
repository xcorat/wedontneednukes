# [ESTABLISHED] Code Conventions

## Languages & Frameworks
- **TypeScript**: Strict mode enabled. Explicit return types on exported functions.
- **Svelte 5**: ONLY use runes (`$state`, `$derived`, `$props`, `$effect`, `$bindable`). Legacy reactivity is strictly forbidden.
- **Components**: Use `{#snippet}` for composition, NOT `<slot />`.
- **CSS**: Tailwind utility-first. Custom theme tokens in `tailwind.config.js`.

## shadcn-svelte
- Components live in `src/lib/components/ui/`.
- Always use the `cn()` utility for class merging.

## Naming & Structure
- **Naming**: 
  - `PascalCase` for components.
  - `camelCase` for functions/variables.
  - `kebab-case` for files and directories.
- **Feature Modules**: Each feature in `src/lib/features/{name}/` containing `components/`, `stores.ts`, `index.ts`.
- **Server Code**: ONLY in `src/lib/server/`. SvelteKit prevents client-side import.
- **Imports**: Use `$lib/` alias. Prefer named exports.

## Application Logic
- **Routes**: Keep `+page.server.ts` thin. Parse input, call a service/repository, and return data. No business logic in routes.
- **Comments**: Write JSDoc on all exported functions/types.

## Testing
- **Unit**: Vitest. 
- **E2E**: Playwright.
- Test files should be colocated with the code they test or in the `tests/` directory.
