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

## ADR-14: Content-Addressed Q&A Identity
**Status**: Proposed
**Date**: 2026-09-12
**Context**: As the project moves from the v0 single-`pledge` table to the dynamic gated-questions schema, we need stable, content-derived identifiers for questions and answer choices that survive copy edits and let us detect duplicate and exact-reuse without string compares.
**Decision**:
1. Question identity = SHA-256 of an explicit, length-prefixed, domain-separated byte string built from `type` + canonicalized text + canonicalized answer labels.
2. Three hashes, not one concatenated blob: `textHash`, `answerSetHash`, and a composite `id` derived from both plus `type`. Choice identity is `(questionId, labelHash)`.
3. Public domain prefix `wdnn-qa-v1` (not a secret); rotate only on canonicalization-version bumps.
4. Canonicalization v1 (small on purpose): Unicode NFC → trim → collapse whitespace → lowercase. Punctuation stripping, stemming, markdown peeling are explicitly out of scope for v1.
5. Length-prefixed tagged fields (`<tag>:<len>:<value>`) prevent concatenation collisions. Concat-with-delimiter is forbidden.
6. Truncate to 24 hex (96 bits) for human-facing ids (`qt_`, `as_`, `q_`, `al_`, `opt_`); store full 64-hex content digest on the row for collision insurance.
7. Choice `value` is an internal alias binding key for UI and stats and MUST NOT participate in identity. Choice `label` is public and identity-bearing.
8. Persistence: `question.id` PK + unique `content_sha256` + unique `(campaign_id, slug)` + unique `(question_id, label_hash)` on choices. Slug is the mutable product handle; id/content_sha256 is content identity. The same `question` row can be reused across campaigns via a `campaign_question` join table keyed by `(campaign_id, question_id, order_index)`. Responses store both `question_id` and `content_sha256` so editing copy creates a new question row and preserves old answers against the old id.
**Consequences**:
- Edit copy on a question → new `id`, old responses unchanged. Slug retains the human topic handle.
- Duplicate detection is an index lookup on `content_sha256` / `(text_hash, answer_set_hash)`, not a string compare.
- Similarity search stays a separate problem on raw text; these hashes only answer "same object".
- Hashes are NOT tamper evidence — anyone can recompute them. Integrity of *who answered* still relies on auth + anon cookies + server write path.
- Supersedes the v0 FNV/`id === hash`/bool-blob sketches that mixed identity with display.

## ADR-13: Dual Anonymous Identity & Server-Side Vote Claiming
**Status**: Accepted
**Date**: 2026-09-12
**Context**: Grassroots engagement requires low-friction anonymous voting while allowing visitors to later create an account without losing their pledge history or experiencing layout flicker.
**Decision**:
1. Issue persistent HTTP-only cookie (`anon_id`) on anonymous interactions for instant SSR detection in `+page.server.ts`.
2. When the user logs in or registers, execute an atomic DB migration linking existing `anon_id` records to `user_id`.
**Consequences**: Zero visual flicker (FOUC) on return visits, seamless conversion from anonymous supporter to permanent community member.

## ADR-15: Precompiled In-Memory Markdown Snippets & Prerender Adapter Guard
**Status**: Accepted
**Date**: 2026-09-13
**Context**: Static Markdown content originally made runtime HTTP `fetch()` subrequests inside Cloudflare Workers. Full-page HTML prerendering (`prerender = true`) caused build crashes in `@sveltejs/adapter-cloudflare` (`Cannot access platform.env.DB in a prerenderable route`) and desynced the user session state in `MenuBar` on direct loads.
**Decision**:
1. Add build-time guard in `src/hooks.server.ts` checking `import { building } from '$app/environment'`: skip live DB/auth bindings during build-time crawl.
2. In `src/lib/server/content/loader.ts`, use Vite's `import.meta.glob('/static/**/*.md', { query: '?raw', eager: true })` to inline Markdown at compile time and cache parsed HTML snippets in an in-memory `Map`.
**Consequences**:
- Zero runtime network subrequests in Cloudflare Workers.
- Instant O(1) in-memory snippet lookup (< 0.05ms) with zero runtime `marked` CPU overhead.
- Live user session preserved in `MenuBar` across all informational pages.
- 100% compatibility with `@sveltejs/adapter-cloudflare` and Miniflare.

