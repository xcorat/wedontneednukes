# [ESTABLISHED] Agent Master Guide

This is the master guide for any AI coding agent working on this project. 

## Project Overview
WeDoNotNeedNukes is a modular pledge campaign platform on Cloudflare Workers. It enables rapid creation of pledge flows with branching question trees, auth gates, and action pages. The first campaign focuses on nuclear disarmament. Current Status: Phase 1/2 (Working prototype with D1 migrations, Better Auth 2FA & social logins, neo-brutalist theme system, and modular independent widgets).

## Architecture Summary
- Campaign-agnostic pledge engine & gated question schema
- SvelteKit 2 + Svelte 5 Runes (`$state`, `$derived`, `$props`, `$effect`, `untrack`)
- Modular Component Layer: Independent, composable widgets under `src/lib/components/widgets/`
- Cloudflare Workers + Static Assets (Pages/Workers converged via `@sveltejs/adapter-cloudflare`)
- Better Auth with per-request factory pattern (`getAuth(platform.env)`) supporting email magic links, Two-Factor Authentication (2FA), and social OAuth (Google, GitHub, Facebook, Twitter/X)
- Cloudflare Turnstile bot verification for authentication and guest submissions
- Dual Anonymous Identity & Vote Claiming: Persistent HTTP-only `anon_id` cookie seamlessly claimed into `user_id` upon sign-in
- Cloudflare D1 + Drizzle ORM
- Thin route composition layer: routes compose widgets with minimal presentation code

## Code Conventions
- TypeScript strict mode
- Svelte 5 Runes ONLY — no legacy let-based reactivity
- `{#snippet}` instead of `<slot />`
- `$state()` for reactive state, `$derived()` for computed, `$props()` for component props, `untrack()` when intentionally capturing initial prop state
- Independent Widgets: Reusable page sections live in `src/lib/components/widgets/` with clean TypeScript prop contracts
- Server boundary: all DB/auth/secrets in `src/lib/server/` (SvelteKit enforces this)
- Thin route handlers: `+page.server.ts` handles auth checks, loader data, and form actions
- Per-request factories for D1 and auth (no static singletons)

## File Organization
See `docs/research/folder-structure.md` for full tree.
- `.ai/` — agent context & prompts
- `docs/` — human + AI documentation
- `src/lib/components/widgets/` — independent, composable page section widgets
- `src/lib/components/` — shared UI components (`FundraiserButton`, `MenuButton`, `ThemeSwitcher`, `Turnstile`, etc.)
- `src/lib/server/` — server-only code (`auth/`, `db/`, `profile/`, `account/`, `security/`)
- `src/routes/` — thin composition layer & endpoints (`/`, `/auth`, `/pledge`, `/results`, `/profile`, `/settings`, `/tests`)

## Package Manager & Tooling
- **Package Manager**: **`pnpm` ONLY**. Never use `npm` or `npx`.
  - Install dependencies: `pnpm install` or `pnpm add <pkg>`
  - Run scripts: `pnpm dev`, `pnpm build`, `pnpm check`, `pnpm test`
  - Execute binaries: `pnpm exec <cmd>` or `pnpm dlx <cmd>`
  - Database tasks: `pnpm db:generate`, `pnpm db:migrate`
  - Cloudflare / Wrangler: `pnpm exec wrangler <cmd>`
- **Why NOT Bun**:
  - Cloudflare Workers executes on the **workerd** V8 runtime, not Bun.
  - SvelteKit's `@sveltejs/adapter-cloudflare` and Miniflare's local D1/KV emulation rely on Node.js-compatible APIs and native bindings.
  - `pnpm` has first-class native detection and support in Cloudflare's build platform and strictly honors `"pnpm": { "overrides": { "kysely": ... } }` in `package.json`.

## Key Patterns
- Pledge flows are JSON directed graphs, traversed by a state machine engine
- DB adapter swapped via env var (`DB_ADAPTER=d1|turso|memory`)
- Auth uses Better Auth with factory: `getAuth(platform.env)`
- `wrangler.jsonc` for CF config (not `.toml`)
- `pnpm dlx sv create` for project init (not `npm create svelte` or `npx sv create`)

## Context Files
- [`architecture.md`](context/architecture.md) - System layers and architectural patterns
- [`conventions.md`](context/conventions.md) - Coding rules and patterns
- [`decisions.md`](context/decisions.md) - Architectural Decision Records
- [`glossary.md`](context/glossary.md) - Domain terminology

## How to Contribute
See [CONTRIBUTING.md](../docs/CONTRIBUTING.md)
