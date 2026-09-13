# [ESTABLISHED] Roadmap Status

Status snapshot distilled from `docs/roadmap/phases.md` and `docs/roadmap/milestones.md`. Use this to decide what to work on and what is already settled.

## Phases

### Phase 0 — Documentation & Architecture: ✅ COMPLETED

- Project structure and doc framework.
- `.ai/` context files (architecture, conventions, decisions, glossary).
- ADRs 1–13 in [`decisions.md`](decisions.md).
- Pledge flow engine + gated questions concepts defined.

### Phase 1 — Foundation & Modularization: 🟡 ACTIVE

**Done (✅):**

- SvelteKit 2 on Cloudflare Workers (`@sveltejs/adapter-cloudflare`).
- Neo-brutalist + multi-theme runtime (`src/lib/theme.svelte.ts`, Tailwind v4).
- Better Auth per-request factory (`getAuth(platform.env)`), magic links, social OAuth, 2FA (`/auth/two-factor`).
- Cloudflare Turnstile bot mitigation on auth + anonymous submissions.
- D1 + Drizzle ORM schemas for Better Auth (`user`, `session`, `account`) and core entities (`campaign`, `pledge`).
- Independent composable widgets under `src/lib/components/widgets/`.
- Anonymous `anon_id` cookie flow and atomic vote claiming into `user_id`.

**Open (⬜) — These are the active work items:**

1. **Gated Questions Schema.** Migrate from the single `pledge` table to the dynamic `question` / `question_option` / `question_gate` / `user_response` model described in [`data-model.md`](data-model.md) and `docs/design/user-flows-and-data-architecture.md` §4.
2. **Dedicated Onboarding Routes.** Standalone routes `/onboarding/wedontneednukes`, `/onboarding/join`, `/onboarding/pledge` (currently the recovery logic lives inline in `/`, `/auth`, `/pledge`).

### Phase 2 — Community & Growth: ⏳ PLANNED

- R2 user-generated content (memes, videos) — `docs/architecture/community-media.md`.
- Community voting + curation feeds + FAQ wiki editor.
- Social sharing enhancements; AI meme generator.
- RAG campaign agent for community Q&A.

### Phase 3 — Decentralization & Scale: ⏳ PLANNED

- P2P data layer (IPFS / OrbitDB).
- Cryptographically verified pledges.
- Cloudflare Durable Objects for real-time features.
- Federation; native mobile app.

## Funding Milestones (OpenCollective)

| Tier | Unlocks |
|---|---|
| **$1,000** | Production deploy on `wedontneednukes.org`, core pledge flow live, FAQ wiki + Turnstile. |
| **$5,000** | Multi-layer branching pledge paths, dynamic FAQ wiki, 1-click share cards, $1,500 seed marketing. |
| **$10,000** | Basic P2P / verifiable identity, real-time global pledge density visualization. |
| **$15,000** *(minimum)* | R2 community media + voting + i18n for top non-English regions. |
| **$30,000** *(target)* | Decentralized pledge ledger, creator micro-grants, RAG campaign agent, PWA/mobile. |

## Engineering Rule for Phase 1

- Picking up an open Phase 1 item: prefer small, surgical PRs that move the schema forward **without** breaking existing `pledge`-table reads. Use atomic migrations.
- Don't restart finished work in `.ai/` (runes, server boundary, per-request factory, widget decomposition, anon identity). See [`conventions.md`](conventions.md) and [`architecture.md`](architecture.md).
