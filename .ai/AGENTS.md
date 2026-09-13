# [ESTABLISHED] Agent Master Guide

This is the master guide for any AI coding agent working on this project.

## Project Overview

WeDoNotNeedNukes is a modular pledge campaign platform on Cloudflare Workers. It enables rapid creation of pledge flows with branching question trees, auth gates, and action pages. The first campaign focuses on nuclear disarmament. **Current Status:** Phase 1/2 active (Working prototype with D1 migrations, Better Auth 2FA & social logins, neo-brutalist theme system, and modular independent widgets). See [`context/roadmap.md`](context/roadmap.md) for the live status and open items.

## Quick References (start here)

Agents should be able to find everything they need in `.ai/`. Open these before any task.

| File | When to open |
|---|---|
| [`context/architecture.md`](context/architecture.md) | Understanding layered system, widgets, anon identity |
| [`context/conventions.md`](context/conventions.md) | Before writing or reviewing any code |
| [`context/tech-stack.md`](context/tech-stack.md) | Versions, adapters, `svelte.config.js`, `app.d.ts` typing, wrangler |
| [`context/folder-structure.md`](context/folder-structure.md) | Where a new file belongs |
| [`context/data-model.md`](context/data-model.md) | DB schema for auth, gated questions, media |
| [`context/design-tokens.md`](context/design-tokens.md) | CSS variables and theme presets |
| [`context/campaign-nukes.md`](context/campaign-nukes.md) | Hero text, flow screens, FAQ slugs, copy strings |
| [`context/deployment.md`](context/deployment.md) | Env vars, D1 commands, OAuth callbacks, deploy |
| [`context/roadmap.md`](context/roadmap.md) | What's done, what's open, funding tiers |
| [`context/decisions.md`](context/decisions.md) | ADRs — read when picking a non-trivial approach |
| [`context/glossary.md`](context/glossary.md) | Domain terminology |

For deeper prose / human-facing context, see corresponding file under `docs/`.

## Architecture Summary

- Campaign-agnostic pledge engine & gated question schema (target shape in [`data-model.md`](context/data-model.md))
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
- Full conventions: [`conventions.md`](context/conventions.md)

## File Organization — Top-Level

- `.ai/` — agent context & prompts (read these first)
- `docs/` — human + AI documentation (campaign authoring, design prose, roadmaps)
- `src/lib/components/widgets/` — independent, composable page section widgets
- `src/lib/components/` — shared UI components (`FundraiserButton`, `MenuButton`, `ThemeSwitcher`, `Turnstile`, etc.)
- `src/lib/server/` — server-only code (`auth/`, `db/`, `profile/`, `account/`, `security/`)
- `src/routes/` — thin composition layer & endpoints (`/`, `/auth`, `/pledge`, `/results`, `/profile`, `/settings`, `/tests`)
- Full tree: [`folder-structure.md`](context/folder-structure.md)

## Current Status — Open Items

Two Phase 1 items are not yet complete. Picked up work should target one of these unless instructed otherwise:

1. **Gated Questions Schema** — Migrate from the single `pledge` table to the dynamic question tree (`question`, `question_option`, `question_gate`, `user_response`). Target shape documented in [`data-model.md`](context/data-model.md).
2. **Dedicated Onboarding Routes** — Standalone routes `/onboarding/wedontneednukes`, `/onboarding/join`, `/onboarding/pledge`. Today the recovery flow lives inline in `/`, `/auth`, `/pledge`.

See [`roadmap.md`](context/roadmap.md) for full phase status.

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

## Reusable Prompts

- [`prompts/feature.md`](prompts/feature.md) — adding a new feature
- [`prompts/bugfix.md`](prompts/bugfix.md) — investigating and fixing a bug
- [`prompts/review.md`](prompts/review.md) — reviewing a PR

## How to Contribute (humans)

See [`docs/CONTRIBUTING.md`](../docs/CONTRIBUTING.md).
