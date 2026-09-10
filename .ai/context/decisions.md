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
