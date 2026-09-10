# [ESTABLISHED] Agent Master Guide

This is the master guide for any AI coding agent working on this project. 

## Project Overview
WeDoNotNeedNukes is a modular pledge campaign platform on Cloudflare Workers. It enables rapid creation of pledge flows with branching question trees, auth gates, and action pages. The first campaign focuses on nuclear disarmament. Currently in Phase 0 (Documentation & Architecture).

## Architecture Summary
- Campaign-agnostic pledge engine
- SvelteKit 2 + Svelte 5 Runes (`$state`, `$derived`, `$props`, `$effect`)
- shadcn-svelte 1.6.x — runes-native, uses `{#snippet}` not `<slot />`
- Cloudflare Workers + Static Assets (Pages/Workers converged)
- Better Auth with per-request factory pattern (D1 injected via `platform.env`)
- D1 + Drizzle ORM with repository pattern abstraction
- Feature-driven structure: `src/lib/features/{pledge,auth,content,faq,campaign}/`

## Code Conventions
- TypeScript strict mode
- Svelte 5 Runes ONLY — no legacy let-based reactivity
- `{#snippet}` instead of `<slot />`
- `$state()` for reactive state, `$derived()` for computed, `$props()` for component props
- Feature modules: colocate components, stores, types per feature
- Server boundary: all DB/auth/secrets in `src/lib/server/` (SvelteKit enforces this)
- Thin route handlers: `+page.server.ts` only parses input and calls domain functions
- Repository pattern: all DB access through typed interfaces
- Per-request factories for D1 and auth (no static singletons)

## File Organization
See `docs/research/folder-structure.md` for full tree.
- `.ai/` — agent context
- `docs/` — human + AI docs
- `src/lib/components/ui/` — shadcn-svelte primitives
- `src/lib/features/` — domain feature modules
- `src/lib/server/` — server-only code (DB, auth, services)
- `src/routes/` — thin composition layer

## Key Patterns
- Pledge flows are JSON directed graphs, traversed by a state machine engine
- DB adapter swapped via env var (`DB_ADAPTER=d1|turso|memory`)
- Auth uses Better Auth with factory: `getAuth(platform.env)`
- `wrangler.jsonc` for CF config (not `.toml`)
- `npx sv create` for project init (not `npm create svelte`)

## Context Files
- [`architecture.md`](context/architecture.md) - System layers and architectural patterns
- [`conventions.md`](context/conventions.md) - Coding rules and patterns
- [`decisions.md`](context/decisions.md) - Architectural Decision Records
- [`glossary.md`](context/glossary.md) - Domain terminology

## How to Contribute
See [CONTRIBUTING.md](../docs/CONTRIBUTING.md)
