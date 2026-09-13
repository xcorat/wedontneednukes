# [ESTABLISHED] Architectural Decision Records (ADRs)

## ADR-1: Use SvelteKit 2 with Svelte 5 Runes
**Status**: Accepted
**Date**: 2026-09-09
**Context**: Needed a frontend framework for high-performance edge delivery.
**Decision**: SvelteKit 2 with Svelte 5 Runes (not React/Next.js/Astro).
**Consequences**: Edge-native, small bundle size, runes provide explicit and clean reactivity.

## ADR-2: Cloudflare Workers over Vercel/Netlify
**Status**: Accepted
**Date**: 2026-09-09
**Context**: Hosting platform selection.
**Decision**: Cloudflare Workers.
**Consequences**: D1/R2/KV native bindings, edge-first execution, generous free tier.

## ADR-3: Better Auth over Auth.js/Lucia
**Status**: Accepted
**Date**: 2026-09-09
**Context**: Authentication library needed.
**Decision**: Better Auth.
**Consequences**: Lucia is deprecated. Better Auth has native D1+Drizzle support and is TS-first.

## ADR-4: Repository pattern for DB abstraction
**Status**: Accepted
**Date**: 2026-09-09
**Context**: We need flexibility in our database layer for future p2p or local migrations.
**Decision**: Use Repository pattern for DB abstraction.
**Consequences**: Enables future migration to Turso/P2P without rewriting services. Adds slight boilerplate.

## ADR-5: Campaign-agnostic engine
**Status**: Accepted
**Date**: 2026-09-09
**Context**: Platform flexibility.
**Decision**: Pledge flows as JSON data, not hardcoded logic.
**Consequences**: Supports future campaigns seamlessly.

## ADR-6: Per-request factory for D1/Auth
**Status**: Accepted
**Date**: 2026-09-09
**Context**: Workers concurrency model.
**Decision**: CF Workers inject bindings per-request; cannot use static singletons. We use per-request factories.
**Consequences**: Auth and DB clients instantiated via context (`getAuth(platform.env)`).

## ADR-7: shadcn-svelte over custom components
**Status**: Accepted
**Date**: 2026-09-09
**Context**: Component library selection.
**Decision**: Use shadcn-svelte.
**Consequences**: Accessible, themeable, community-maintained, runes-native (v1.6+).

## ADR-8: Cloudflare Turnstile over hCaptcha/reCAPTCHA
**Status**: Accepted
**Date**: 2026-09-09
**Context**: Bot protection for anonymous pledges.
**Decision**: Cloudflare Turnstile.
**Consequences**: Free, privacy-preserving, native CF integration.

## ADR-9: Use pnpm over npm and Bun
**Status**: Accepted
**Date**: 2026-09-12
**Context**: Selection of package manager and tooling for Cloudflare Workers & SvelteKit 2 development.
**Decision**: Use `pnpm` exclusively. Do not use `npm` or switch to `bun`.
**Consequences**:
- **Workerd Alignment**: Cloudflare Workers runs production code in the `workerd` V8 runtime, not Bun. Vite and `@sveltejs/adapter-cloudflare` rely on standard Node.js module resolution.
- **Miniflare Compatibility**: Local development uses Wrangler + Miniflare to simulate D1, KV, and bindings. Miniflare relies on Node.js built-ins and native packages that have known runtime incompatibilities when executed under Bun.
- **Cloudflare CI/CD**: Cloudflare Pages / Workers build pipelines natively detect `pnpm-lock.yaml` and install via pnpm out of the box without custom scripts.
- **Dependency Overrides**: Preserves required `"pnpm": { "overrides": { "kysely": ... } }` in `package.json` for Better-Auth D1 integration.
- **Speed & Determinism**: Fast, content-addressable store without phantom dependencies.

## ADR-10: Component Decomposition into Independent Widgets
**Status**: Accepted
**Date**: 2026-09-12
**Context**: Route components (`/`, `/auth`, `/pledge`, `/results`) were monolithic and difficult to reuse across onboarding experiments, embeds, and test suites.
**Decision**: Extract page sections into self-contained widgets under `src/lib/components/widgets/` (`QuestionHeroWidget`, `JoinFormWidget`, `PledgeFormWidget`, `ResultsWidget`, `ClaimVoteBanner`, `StepHeaderWidget`) exported through a central `index.ts`.
**Consequences**: Routes become thin composition shells. Widgets can be independently tested, themed, and embedded in multiple contexts (e.g., onboarding steps or inline drawers).

## ADR-11: Neo-Brutalist Design System with Dynamic Multi-Theme Runtime
**Status**: Accepted
**Date**: 2026-09-12
**Context**: Need a distinctive, energetic visual identity that appeals to grassroots movements while supporting multiple stylistic tastes (cartoonish 2D game, ultra-compact, flat minimal, dark).
**Decision**: Implement a Neo-Brutalist foundation using Tailwind CSS v4 variables in `src/app.css` paired with a runes-based dynamic theme switcher (`theme.svelte.ts`) manipulating `data-theme` on `:root`.
**Consequences**: Zero CSS bloat, instant zero-runtime stylesheet updates, user theme preference persisted in `localStorage`.

## ADR-12: Multi-Provider Social Login with Optional Email & Two-Factor Authentication
**Status**: Accepted
**Date**: 2026-09-12
**Context**: Modern auth requires frictionless social logins (Google, GitHub, Facebook, Twitter/X), passwordless magic links, and optional high-security protections without forcing mandatory email entry on OAuth.
**Decision**: Configure Better Auth with optional user email schema, social providers mapping placeholder emails where needed, and native Two-Factor Authentication plugin (`/auth/two-factor`).
**Consequences**: Eliminates friction for users without public emails on OAuth, provides high-security 2FA for sensitive accounts, and safe account unlinking rules.

## ADR-13: Dual Anonymous Identity & Server-Side Vote Claiming
**Status**: Accepted
**Date**: 2026-09-12
**Context**: Grassroots engagement requires low-friction anonymous voting while allowing visitors to later create an account without losing their pledge history or experiencing layout flicker.
**Decision**:
1. Issue persistent HTTP-only cookie (`anon_id`) on anonymous interactions for instant SSR detection in `+page.server.ts`.
2. When the user logs in or registers, execute an atomic DB migration linking existing `anon_id` records to `user_id`.
**Consequences**: Zero visual flicker (FOUC) on return visits, seamless conversion from anonymous supporter to permanent community member.

